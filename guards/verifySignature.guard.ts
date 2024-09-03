import 'dotenv/config';
import { Injectable, CanActivate, ExecutionContext, BadRequestException, UnauthorizedException } from '@nestjs/common';
import dayjs from 'dayjs';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthMessage, AuthMessageRepository, AuthMessageStatus } from '@modules/auth/auth-message.entity';
import { verifySignature } from '../helpers/digitalSignature';
import { logger } from '../helpers/logger';
import { ErrorResponseCodes } from '@constants/errorResponseCodes';


const LOG_NAME = 'AUTH_DIGITAL_SIGNATURE_GUARD';

const { SIGNATURE_GUARD_TIMEOUT_SECONDS = 120 } = process.env;

@Injectable()
export class VerifySignatureGuard implements CanActivate {
  constructor(@InjectRepository(AuthMessage) private readonly authMessageRepository: AuthMessageRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const [req] = context.getArgs();
    const { body } = req;
    const { signature, message, clientAuthPubKey } = body;

    const payload = { signature, message, clientAuthPubKey };
    if (!signature) {
      throw new BadRequestException({ message: 'Signature is required' });
    }

    if (!clientAuthPubKey) {
      throw new BadRequestException({
        errorCode: ErrorResponseCodes.request_payload_missing,
        message: 'Client auth public key is required',
      });
    }

    if (!message) {
      throw new BadRequestException({
        errorCode: ErrorResponseCodes.request_payload_missing,
        message: 'The signed message is required',
      });
    }

    // Eth-crypto library doesn't support `0x` prefixed pub key and should be trimed
    if (/^0x/.test(clientAuthPubKey)) {
      throw new BadRequestException({
        errorCode: ErrorResponseCodes.request_payload_wrong_format,
        message: 'Wrong client auth public key format',
      });
    }

    const foundMessage = await this.authMessageRepository.findOne({
      where: {
        clientAuthPubKey,
        message,
      },
    });

    if (!foundMessage) {
      const errorMessage = 'Unauthorized client pub key';
      logger.error(errorMessage, {
        LOG_NAME,
        payload,
        message,
      });
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_client_pub_key_and_message_not_match,
        message: errorMessage,
      });
    }

    if (dayjs(foundMessage?.createdAt).isBefore(dayjs().subtract(Number(SIGNATURE_GUARD_TIMEOUT_SECONDS), 'seconds'))) {
      const errorMessage = 'The signature had already expired';
      logger.error(errorMessage, {
        LOG_NAME,
        payload,
      });
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_client_pub_key_and_message_expired,
        message: errorMessage,
      });
    }

    if (foundMessage.status !== AuthMessageStatus.PENDING) {
      const errorMessage = `The message had already been ${foundMessage.status}`;
      logger.error(errorMessage, {
        LOG_NAME,
        payload,
      });
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_client_pub_key_and_message_expired,
        message: errorMessage,
      });
    }

    const validSignature = verifySignature({
      signature,
      message,
      publicKey: clientAuthPubKey,
    });

    if (!validSignature) {
      const errorMessage = 'Signature verification failed';
      logger.error(errorMessage, {
        LOG_NAME,
        payload,
      });

      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_client_pub_key_and_message_signature_failed,
        message: errorMessage,
      });
    }

    // Invalidate the message to avoid being used more than once
    await this.authMessageRepository.update(
      {
        id: foundMessage.id,
      },
      {
        status: AuthMessageStatus.USED,
      },
    );

    return true;
  }
}

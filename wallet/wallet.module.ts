import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletController } from '@modules/wallet/wallet.controller';
import { WalletService } from '@modules/wallet/wallet.service';
import { AuthMessage } from '@modules/auth/auth-message.entity';
import { User } from '@modules/user/user.entity';
import { AssetConfig } from '@modules/asset/asset-config.entity';
import { Wallet } from '@modules/wallet/wallet.entity';
import { UserAsset } from '@modules/user/user-asset.entity';
import { Revision } from '@modules/revision/revision.entity';
import { AuthPublicKey } from '@modules/auth-public-key/auth-public-key.entity';
import { AuthService } from '@modules/auth/auth.service';
import { MultisigParticipant } from '@modules/transactions/multisigParticipant.entity';
import { Transaction } from '@modules/transactions/transaction.entity';
import { Chain } from '@modules/chain/chain.entity';
import { AuthToken } from '@modules/auth/auth-token.entity';
import { JwtService } from '@nestjs/jwt';
import { WalletRecoveryCode } from './walletRecoveryCode.entity';
import { QueryService } from '@modules/query/query.service';
import { MerchantAsset } from '@modules/merchant/merchant-asset.entity';
import { Merchant } from '@modules/merchant/merchant.entity';
import { UserOtp } from '@modules/auth/user-otp.entity';
import { UserService } from '@modules/user/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuthMessage,
      AuthPublicKey,
      AuthToken,
      User,
      UserAsset,
      AssetConfig,
      Wallet,
      Revision,
      WalletRecoveryCode,
      AuthPublicKey,
      MultisigParticipant,
      Transaction,
      Chain,
      MerchantAsset,
      Merchant,
      UserOtp,
    ]),
  ],
  controllers: [WalletController],
  providers: [WalletService, AuthService, JwtService, QueryService, UserService],
  exports: [WalletService],
})
export class WalletModule {}

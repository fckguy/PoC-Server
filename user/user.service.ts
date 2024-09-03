import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { pick, omit } from 'lodash';
import { User, UserRepository, UserRole } from '@modules/user/user.entity';
import { Wallet, WalletRepository } from '@modules/wallet/wallet.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthPublicKey, AuthPublicKeyRepository } from '@modules/auth-public-key/auth-public-key.entity';
import {
  MultisigParticipant,
  MultisigParticipantRepository,
  MultisigParticipantStatus,
} from '@modules/transactions/multisigParticipant.entity';
import { Transaction, TransactionRepository } from '@modules/transactions/transaction.entity';
import {
  AssetConfigStatus,
  AssetType,
  ChainName,
  ChainStatus,
  OwnershipType,
  GroupedAssets,
} from '@modules/asset/models/asset.models';
import { UserAsset, UserAssetRepository, UserAssetSource } from './user-asset.entity';
import {
  AddUserAssetDto,
  AddUserAssetResponseDto,
  GetAllUsersResponseDto,
  GetParticipantsByUserIdResponseDto,
  GetUserAssetsByUserIdQueryDto,
  GetUserAssetsByUserIdResponseDto,
  GetUserByExternalUserIdResponseDto,
  GetUserByIdResponseDto,
  RemoveUserFromUserQueryDto,
  RemoveUserFromUserResponseDto,
  UpdateProfileDto,
  UpdateProfileResponseDto,
  UserSaltResponseDto,
  UserWalletsResponseDto,
} from './user.dto';
import { cryptographer } from '@helpers/cryptographer';
import { AssetConfig, AssetConfigRepository } from '@modules/asset/asset-config.entity';
import { paginateRecord } from '@helpers/paginateRecord';
import { getNestedProperty } from '@helpers/getNestedProperty';
import { PaginationQueryDto } from './pagination.dto';
import { ILike } from 'typeorm';
import { isUUID } from 'class-validator';
import { ErrorResponseCodes } from '@constants/errorResponseCodes';
import { Chain, ChainRepository } from '@modules/chain/chain.entity';
import logger from '@helpers/logger';
import { isEvmAddress, isAlgoAddress, isBtcAddress } from '@helpers/verifyWalletAddress';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: UserRepository,
    @InjectRepository(Wallet) private readonly walletRepository: WalletRepository,
    @InjectRepository(AuthPublicKey) private readonly publicKeyRepository: AuthPublicKeyRepository,
    @InjectRepository(UserAsset) private readonly userAssetRepository: UserAssetRepository,
    @InjectRepository(MultisigParticipant) private readonly multisigParticipant: MultisigParticipantRepository,
    @InjectRepository(Transaction) private readonly transactionRepository: TransactionRepository,
    @InjectRepository(AssetConfig) private readonly assetConfigRepository: AssetConfigRepository,
    @InjectRepository(Chain) private readonly chainRepository: ChainRepository,
  ) {}

  async getUserWalletsByUserId(id: string): Promise<UserWalletsResponseDto> {
    const foundUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const wallets = await this.walletRepository.find({
      where: {
        userId: foundUser.id,
      },
    });

    return {
      wallets,
    };
  }

  async getUserAssetsByUserId(
    id: string,
    { chainName, symbol, isVisible, tokenStandard, groupBy, ...query }: GetUserAssetsByUserIdQueryDto,
  ): Promise<GetUserAssetsByUserIdResponseDto> {
    const foundUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    const where: any = {
      userId: foundUser.id,
    };

    if (chainName) {
      where.config = {
        chainName,
      };
    }

    if (symbol) {
      where.config = {
        ...(where.config || {}),
        symbol,
      };
    }

    if (typeof isVisible !== 'undefined') {
      where.isVisible = isVisible;
    }

    if (tokenStandard) {
      where.config = {
        ...(where.config || {}),
        tokenStandard,
      };
    }

    const { records, pagination } = await paginateRecord({
      ...query,
      repository: this.userAssetRepository,
      relations: ['merchant', 'config', 'config.chain'],
      select: {
        merchant: {
          id: true,
          name: true,
        },
        config: {
          id: true,
          name: true,
          type: true,
          status: true,
          symbol: true,
          chainId: true,
          iconUrl: true,
          decimals: true,
          verified: true,
          chainName: true,
          merchantId: true,
          tokenStandard: true,
          contractAddress: true,
          createdByUserId: true,
          createdByMerchantId: true,
          chain: {
            id: true,
            name: true,
            status: true,
            iconUrl: true,
            testnetId: true,
            mainnetId: true,
            addressRegex: true,
          },
        },
      },
      where,
    });

    let evmAddress = null;
    let algoAddress = null;
    let btcAddress = null;
    const assets = records
      .filter(
        (userAsset) =>
          userAsset.isVisible &&
          userAsset.config?.chain?.status === ChainStatus.UP &&
          (!userAsset?.config?.status || userAsset?.config?.status === AssetConfigStatus.active),
      )
      .map((item) => {
        if (isEvmAddress(item.defaultAddress)) {
          evmAddress = item.defaultAddress;
        }

        if (isAlgoAddress(item.defaultAddress)) {
          algoAddress = item.defaultAddress;
        }

        if (isBtcAddress(item.defaultAddress)) {
          btcAddress = item.defaultAddress;
        }

        const nonMultisigAsset: AssetConfig = omit(item?.config, [
          'multisigVersion',
          'multisigSignerThreshold',
          'ownerAddresses',
          'multisigParticipants',
        ]) as AssetConfig;

        return {
          config: item?.config?.ownershipType !== OwnershipType.MULTI_SIG ? nonMultisigAsset : item.config,
          ...item,
        };
      });

    const wallet = await this.walletRepository.findOne({
      where: {
        id: assets[0]?.walletId,
      },
    });

    // Update the wallet with missing default the addresses
    if (
      wallet &&
      (wallet.evmAddress !== evmAddress || wallet.algoAddress !== algoAddress || wallet.btcAddress !== btcAddress)
    ) {
      await this.walletRepository.update(
        {
          id: wallet.id,
        },
        {
          evmAddress,
          algoAddress,
          btcAddress,
        },
      );
    }

    if (!!groupBy) {
      const groupedAssets: GroupedAssets[] =
        assets.reduce((acc, asset) => {
          const groupByKey = getNestedProperty(asset, groupBy) ?? '';

          if (!acc[groupByKey]) {
            acc[groupByKey] = [];
          }

          acc[groupByKey].push(asset);
          return acc;
        }, {}) || {};

      return {
        assets,
        groupedAssets,
        pagination,
      };
    }

    return {
      assets,
      pagination,
    };
  }

  async addAssetToUser(
    { assetConfigId, walletId, userId, config }: AddUserAssetDto,
    loggedInUser,
  ): Promise<AddUserAssetResponseDto> {
    let source = UserAssetSource.USER;

    if (loggedInUser.role === UserRole.MERCHANT_ADMIN) {
      source = UserAssetSource.MERCHANT;
    }

    if (loggedInUser.role === UserRole.SUPER_ADMIN || loggedInUser.role === UserRole.REPUBLIC_ADMIN) {
      source = UserAssetSource.REPUBLIC;
    }

    if (loggedInUser.id === userId) {
      source = UserAssetSource.USER;
    }

    const foundUser = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!foundUser) {
      throw new NotFoundException({ message: 'User was not found' });
    }

    if (!this.hasUserPermissions({ loggedInUser, user: foundUser })) {
      throw new ForbiddenException({
        errorCode: ErrorResponseCodes.auth_user_not_allowed_to_perform_the_action,
        message: 'You are not authorized to perform this action',
      });
    }

    const foundWallet = await this.walletRepository.findOne({
      where: {
        id: walletId,
        userId,
      },
    });

    if (!foundWallet) {
      throw new NotFoundException('Wallet not found');
    }

    let assetConfig: AssetConfig;

    const where = assetConfigId ? { id: assetConfigId } : { symbol: config?.symbol, chainId: config?.chainId };

    assetConfig = await this.assetConfigRepository.findOne({
      relations: ['chain'],
      where: where,
    });

    logger.info('UserService::addAssetToUser 1', {
      config,
      foundAssetConfig: assetConfig,
      foundWallet,
    });

    if (!assetConfig) {
      const foundChain = await this.chainRepository.findOne({
        where: {
          id: config?.chainId,
        },
      });

      if (!foundChain) {
        logger.error(`UserService::addAssetToUser Chain not found`, {
          config,
        });
        throw new NotFoundException({ message: 'Chain not found' });
      }

      assetConfig = await this.assetConfigRepository.save({
        ...config,
        chainName: foundChain?.name,
        type: config?.type ?? !config?.tokenStandard ? AssetType.COIN : AssetType.TOKEN,
        ticker: config?.ticker ?? config?.symbol,
        merchantId: foundUser?.merchantId,
        createdByUserId: userId,
      });

      logger.info('UserService::addAssetToUser new assetConfig', {
        config,
        assetConfig,
      });
    }

    const foundUserAsset = await this.userAssetRepository.findOne({
      where: {
        userId,
        configId: assetConfig.id,
        walletId,
      },
    });

    if (foundUserAsset) {
      throw new ConflictException(`The user asset already exists in this wallet.`);
    }

    logger.info('UserService::addAssetToUser 2', {
      foundAssetConfig: assetConfig,
      foundUserAsset,
    });

    const userAsset = await this.userAssetRepository.save({
      chainId: assetConfig.chainId,
      userId,
      walletId,
      merchantId: foundUser.merchantId,
      configId: assetConfig?.id,
      assetName: assetConfig?.name,
      assetSymbol: assetConfig?.symbol,
      defaultAddress: this.getDefaultAddress(assetConfig?.chain?.name as ChainName, foundWallet),
      isVisible: true,
      source,
      createdByUserId: userId,
    });

    const assetsCount = await this.userAssetRepository.count({
      where: {
        walletId: foundWallet.id,
      },
    });

    this.walletRepository.update(
      {
        id: foundWallet.id,
      },
      {
        assetsCount,
      },
    );

    logger.info('UserService::addAssetToUser 3', {
      userAsset,
    });

    return {
      asset: userAsset,
    };
  }

  async getCurrentUser(user: User): Promise<GetUserByIdResponseDto> {
    return {
      user: {
        id: user.id,
        externalUserId: user.externalUserId,
        latestWallabyAuthPubKey: user.latestWallabyAuthPubKey,
        latestWallabyAuthPubKeyVersion: user.latestWallabyAuthPubKeyVersion,
        firstName: user.firstName,
        role: user.role,
        walletsCount: user.walletsCount,
      },
    };
  }

  /**
   * Retrieve the user by the externalUserId provided by the third party on signup
   * @param id The user's primary key
   * @param { User } currentUser The user object from request
   * @returns
   */
  async getUserById(id: string, currentUser: User): Promise<GetUserByIdResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (id !== currentUser.id && ![UserRole.SUPER_ADMIN, UserRole.REPUBLIC_ADMIN].includes(currentUser.role)) {
      throw new ForbiddenException({
        errorCode: ErrorResponseCodes.auth_user_not_allowed_to_perform_the_action,
        message: "You are not authorized to access another user's profile",
      });
    }

    return {
      user: {
        id: user.id,
        externalUserId: user.externalUserId,
        latestWallabyAuthPubKey: user.latestWallabyAuthPubKey,
        latestWallabyAuthPubKeyVersion: user.latestWallabyAuthPubKeyVersion,
        firstName: user.firstName,
        role: user.role,
        walletsCount: user.walletsCount,
      },
    };
  }

  /**
   * Retrieve the user by the externalUserId provided by the third party on signup
   * @param currentUserId The user's externalUserId
   * @returns
   */
  async getUserByExternalUserId(externalUserId: string): Promise<GetUserByExternalUserIdResponseDto> {
    const user = await this.userRepository.findOne({
      where: { externalUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      user: {
        id: user.id,
        externalUserId: user.externalUserId,
        latestWallabyAuthPubKey: user.latestWallabyAuthPubKey,
        latestWallabyAuthPubKeyVersion: user.latestWallabyAuthPubKeyVersion,
        firstName: user.firstName,
        walletsCount: user.walletsCount,
      },
    };
  }

  async updateProfile(data: UpdateProfileDto): Promise<UpdateProfileResponseDto> {
    if (Object.keys(omit(data, ['message', 'signature', 'clientAuthPubKey'])).length === 0) {
      throw new BadRequestException({ message: 'Nothing was updated' });
    }

    const { clientAuthPubKey } = data;

    const authPublicKey = await this.publicKeyRepository.findOne({
      relations: ['user'],
      where: {
        publicKey: clientAuthPubKey,
      },
    });

    if (!authPublicKey?.user) {
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_client_pub_key_not_found,
        message: `Unauthorized client auth pub key${authPublicKey}`,
      });
    }

    const userData = {
      firstName: data?.firstName || authPublicKey?.user?.firstName || null,
      lastName: data?.lastName || authPublicKey?.user?.lastName || null,
      email: data?.email || authPublicKey?.user?.email || null,
    };

    await this.userRepository.update(
      {
        id: authPublicKey.user.id,
      },
      {
        ...userData,
      },
    );

    return {
      message: 'Profile updated successfully',
      user: pick(
        {
          ...authPublicKey.user,
          ...userData,
        },
        [
          'id',
          'externalUserId',
          'latestWallabyAuthPubKey',
          'latestWallabyAuthPubKeyVersion',
          'firstName',
          'walletsCount',
        ],
      ),
    };
  }

  async getCurrentUserSalt(id: string): Promise<UserSaltResponseDto> {
    const foundUser = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!foundUser) {
      throw new NotFoundException({ message: `User ${id} was not found` });
    }

    if (!foundUser.clientSalt) {
      const clientSalt = cryptographer.generateSalt();
      await this.userRepository.update(
        {
          id,
        },
        {
          clientSalt,
        },
      );
      foundUser.clientSalt = clientSalt;
    }

    return {
      clientSalt: foundUser.clientSalt,
    };
  }

  async getParticipantsByUserId({
    userId,
    status,
  }: {
    userId: string;
    status?: MultisigParticipantStatus;
  }): Promise<GetParticipantsByUserIdResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({ message: 'User not found' });
    }

    let query = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('ownershipType', { ownershipType: OwnershipType.MULTI_SIG })
      .leftJoinAndSelect('transaction.multisigParticipants', 'participant')
      .where('participant.userId=:userId', { userId });

    if (status) {
      query = query.where('participant.status=:status', { status });
    }

    const multisigTransactions = await query.getMany();

    return {
      multisigTransactions,
    };
  }

  async removeAssetFromUser(
    { walletId, userId, assetConfigId }: RemoveUserFromUserQueryDto,
    loggedInUser: User,
  ): Promise<RemoveUserFromUserResponseDto> {
    const foundUser = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!foundUser) {
      throw new NotFoundException('User not found');
    }

    if (!this.hasUserPermissions({ loggedInUser, user: foundUser })) {
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_user_not_allowed_to_perform_the_action,
        message: 'You are not authorized to perform this action',
      });
    }

    const foundUserAsset = await this.userAssetRepository.findOne({
      where: {
        userId,
        walletId,
        configId: assetConfigId,
      },
    });

    if (!foundUserAsset) {
      throw new NotFoundException({
        errorCode: ErrorResponseCodes.asset_not_found,
        message: 'User asset not found',
      });
    }

    await this.userAssetRepository.delete({
      id: foundUserAsset.id,
    });

    return {
      message: 'User asset removed successfully',
    };
  }

  hasUserPermissions({ loggedInUser, user }: { loggedInUser: User; user: User }): boolean {
    if (loggedInUser.id === user.id) {
      return true;
    }

    if ([UserRole.SUPER_ADMIN, UserRole.REPUBLIC_ADMIN].includes(loggedInUser.role)) {
      return true;
    }

    if (loggedInUser.role === UserRole.MERCHANT_ADMIN && loggedInUser.merchantId === user.merchantId) {
      return true;
    }

    if ([UserRole.MERCHANT_ADMIN].includes(loggedInUser.role)) {
      return true;
    }

    throw new ForbiddenException({
      errorCode: ErrorResponseCodes.auth_user_not_allowed_to_perform_the_action,
      message: 'You are not allowed to perform this action',
    });
  }

  private getDefaultAddress(chainName: ChainName, wallet: Wallet): string {
    switch (chainName) {
      case ChainName.ALGORAND:
        return wallet.algoAddress;
      case ChainName.BITCOIN:
        return wallet.btcAddress;
      default:
        return wallet.evmAddress;
    }
  }

  async getAllUsers({ search, ...query }: PaginationQueryDto): Promise<GetAllUsersResponseDto> {
    const where = [];
    if (search) {
      if (isUUID(search)) {
        where.push(
          {
            id: search,
          },
          {
            externalUserId: search,
          },
        );
      } else {
        where.push({
          email: ILike(`%${search}%`),
        });
      }
    }
    const { records, pagination } = await paginateRecord({
      ...query,
      where,
      repository: this.userRepository,
    });

    return {
      users: records,
      pagination,
    };
  }
}

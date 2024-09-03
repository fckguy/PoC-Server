import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  forwardRef,
  UnauthorizedException,
  Scope,
} from '@nestjs/common';
import { omit, pick } from 'lodash';
import {
  InitiateWalletRecoveryDto,
  WalletCompleteRecoveryCodeDto,
  WalletCompleteRecoveryCodeResponseDto,
  MultisigCreationRequestDto,
  GetUserAssetResponseDto,
  WalletCreatedDto,
  InitiateWalletRecoveryResponseDto,
  MnemonicConversionToAlgoSpecificRequestDto,
  MnemonicConversionToAlgoSpecificResponseDto,
  WalletSeedImportRequestDto,
  MultisigCreationResponseDto,
  GetUserAssetRequestDto,
  UserAssetDto,
  GetAllWalletsResponseDto,
  GetWalletAssetQueryDto,
  UpdateUserAssetRequestDto,
  UpdateUserAssetResponseDto,
  GetAllWalletsRequestDto,
} from '@modules/wallet/wallet.dto';
import { fetchRandomBytes, fetchWallabyAuthKeys } from '@services/kms';

import { entropyToMnemonic } from 'bip39';
import { lib } from 'crypto-js';
import { assetService } from '@modules/asset/asset.service';
import { AuthGuardDto } from '@modules/auth/auth.dto';
import { User, UserRepository, UserRole } from '@modules/user/user.entity';
import { AssetConfig, AssetConfigRepository } from '@modules/asset/asset-config.entity';
import { Wallet, WalletRepository } from '@modules/wallet/wallet.entity';
import { UserAsset, UserAssetRepository } from '@modules/user/user-asset.entity';
import { Revision, RevisionRepository } from '@modules/revision/revision.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { encryptWithPublicKey } from '@helpers/encryptData';
import {
  AssetConfigStatus,
  ChainSlip44,
  ChainStatus,
  GroupedAssets,
  OwnershipType,
} from '@modules/asset/models/asset.models';
import algosdk from 'algosdk';
import { cryptographer } from '@helpers/cryptographer';
import { stringMiddleEllipsis } from '@helpers/stringMiddleEllipsis';
import { AuthPublicKey, AuthPublicKeyRepository } from '@modules/auth-public-key/auth-public-key.entity';
import { decryptWithPrivateKey } from '@helpers/decryptData';
import { AuthMessage, AuthMessageRepository } from '@modules/auth/auth-message.entity';
import { Chain, ChainRepository } from '@modules/chain/chain.entity';
import { In, IsNull, LessThan, Not } from 'typeorm';
import { AuthService } from '@modules/auth/auth.service';
import { generateRandomBytes } from '@helpers/generateRandomBytes';
import logger from '@helpers/logger';
import { getNestedProperty } from '@helpers/getNestedProperty';
import { AlgoTransactionSigner } from '@modules/signers/AlgoTransactionSigner';
import { decryptSeedPhrase } from '@helpers/decryptSeedPhrase';
import dayjs from 'dayjs';
import { BulkBalanceQueryDto } from '@modules/query/query.dto';
import { QueryService } from '@modules/query/query.service';
import { MerchantAsset, MerchantAssetRepository } from '@modules/merchant/merchant-asset.entity';
import { paginateRecord } from '@helpers/paginateRecord';
import { CustomRequest } from '@root/types/CustomRequest';
import { REQUEST } from '@nestjs/core';
import { isAlgoAddress, isBtcAddress, isEvmAddress } from '@helpers/verifyWalletAddress';
import { ErrorResponseCodes } from '@constants/errorResponseCodes';
import { getEVMWalletAddressFromSeed } from '@helpers/getEVMWalletAddressFromSeed';

@Injectable({ scope: Scope.REQUEST })
export class WalletService {
  constructor(
    @Inject(REQUEST) private request: CustomRequest,
    @InjectRepository(User) private readonly userRepository: UserRepository,
    @InjectRepository(AssetConfig) private readonly assetConfigRepository: AssetConfigRepository,
    @InjectRepository(MerchantAsset) private readonly merchantAssetRepository: MerchantAssetRepository,
    @InjectRepository(Wallet) private readonly walletRepository: WalletRepository,
    @InjectRepository(UserAsset) private readonly userAssetRepository: UserAssetRepository,
    @InjectRepository(Revision) private readonly revisionRepository: RevisionRepository,
    @InjectRepository(AuthPublicKey) private readonly publicKeyRepository: AuthPublicKeyRepository,
    @InjectRepository(AuthMessage) private readonly authMessageRepository: AuthMessageRepository,
    @InjectRepository(Chain) private readonly chainRepository: ChainRepository,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    @Inject(forwardRef(() => QueryService))
    private readonly queryService: QueryService,
  ) {}

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

  public async importWalletSeed(walletSeedImportRequestDto: WalletSeedImportRequestDto) {
    const { encryptedSeed } = walletSeedImportRequestDto;

    const { clientAuthPubKey } = walletSeedImportRequestDto;

    const foundClientPubKey = await this.publicKeyRepository.findOne({
      relations: ['user'],
      where: { publicKey: clientAuthPubKey },
    });

    if (!foundClientPubKey) {
      throw new UnauthorizedException({
        errorCode: ErrorResponseCodes.auth_client_pub_key_not_found,
        message: `Unauthorized mnemonic phrase wallet import`,
      });
    }

    const seedPhrase = await decryptSeedPhrase({
      userId: foundClientPubKey.userId,
      encryptedSeedPhrase: encryptedSeed,
    });

    if (!seedPhrase) {
      throw new BadRequestException({
        errorCode: ErrorResponseCodes.seedphrase_could_not_be_decrypted,
        message: `The seed phrase could not be decrypted for import. Wrong format or tampered`,
      });
    }

    const wallet = await this.initWalletCreation(seedPhrase, walletSeedImportRequestDto, foundClientPubKey);

    const balanceQuery: BulkBalanceQueryDto = {
      assets: wallet.assets.map((asset) => ({
        address: asset.defaultAddress,
        assetSymbol: asset.assetSymbol,
        tokenType: asset.config.tokenStandard,
      })),
    };

    // Fetch balances for all assets
    const balances = await this.queryService.fetchBulkBalance(balanceQuery);

    // Map the balances to the wallet assets
    wallet.assets = wallet.assets.map((asset) => {
      const foundBalance = balances.balances.find(
        (balance) =>
          balance.address.toLowerCase() === asset.defaultAddress.toLowerCase() &&
          balance.assetSymbol.toLowerCase() === asset.assetSymbol.toLowerCase(),
      );

      return {
        ...asset,
        balance: foundBalance?.balance || null,
      };
    });

    return wallet;
  }

  public async createWallet(createWalletRequest: AuthGuardDto): Promise<WalletCreatedDto> {
    const entropyBuffer = await this.generateEntropy();
    const generatedSeedPhrase = entropyToMnemonic(entropyBuffer);

    return await this.initWalletCreation(generatedSeedPhrase, createWalletRequest);
  }

  private async initWalletCreation(
    generatedSeedPhrase: string,
    authGuardDto: AuthGuardDto,
    publicKey?: AuthPublicKey,
  ): Promise<WalletCreatedDto> {
    let foundPublicKey;

    if (publicKey) {
      foundPublicKey = publicKey;
    } else {
      foundPublicKey = await this.publicKeyRepository.findOne({
        relations: ['user'],
        where: {
          publicKey: authGuardDto.clientAuthPubKey,
          userId: Not(IsNull()),
        },
      });
    }

    if (!foundPublicKey) {
      throw new UnauthorizedException({
        message: `${stringMiddleEllipsis({ text: authGuardDto.clientAuthPubKey })} public key is unknown`,
      });
    }

    const { user } = foundPublicKey;

    let salt = user.hashingSalt;

    if (!salt) {
      salt = cryptographer.generateSalt();
      await this.userRepository.update(
        {
          id: user.id,
        },
        {
          hashingSalt: salt,
        },
      );
    }

    const hashedSeedPhrase = await cryptographer.computeHash({
      data: generatedSeedPhrase,
      salt,
    });

    const persistedAssetConfigs = await this.merchantAssetRepository.find({
      relations: ['chain', 'config'],
      where: {
        merchantId: user.merchantId,
      },
    });

    const foundWallet = await this.walletRepository.findOne({
      relations: ['userAssets'],
      where: {
        hashedSeedPhrase: hashedSeedPhrase.data,
        userId: user.id,
      },
    });

    // Instead of throwing an error here, we can just go ahead and return the wallet related info and its encrypted seed
    // This is very important on cases of wallets re-import
    if (foundWallet) {
      logger.warn('Wallet with the provided seed phrase already exist');

      if (foundWallet.userId !== foundPublicKey.userId) {
        const forbiddenErrorMessage = `You are not allowed to import another user's seed phrase`;

        logger.error(forbiddenErrorMessage, {
          foundWallet: pick(foundWallet, ['id', 'userId']),
          foundPublicKey: pick(foundPublicKey, ['id', 'userId']),
        });

        throw new ForbiddenException(forbiddenErrorMessage);
      }

      const { wallabyAuthPubKey } = await this.authService.getWallabyAuthKeys(authGuardDto.clientAuthPubKey);
      const encryptedSeed = await encryptWithPublicKey({
        publicKey: authGuardDto.clientAuthPubKey,
        text: generatedSeedPhrase,
      });

      // Using a Set here to avoid calling includes() on every iteration inside the filter, which would result in two nested maps.
      const assetConfigIds = new Set(foundWallet.userAssets.map((asset) => asset.config.id));
      const missingAssetConfigs = persistedAssetConfigs.filter((asset) => !assetConfigIds.has(asset.config.id));

      if (missingAssetConfigs.length) {
        const assetConfigs = missingAssetConfigs.map(({ config, chain }) => ({
          name: config.name,
          chain: chain.slip44,
          derivationPath: chain.derivationPath,
          ticker: config.ticker,
          symbol: config.symbol,
          assetType: config.type,
          decimals: config.decimals,
          iconUrl: config.iconUrl,
          chainId: chain.id,
          assetName: config.name,
          assetId: config.id,
          rpcUrl: chain.mainnetRpcUrl,
        }));

        const createdAssetList = await assetService.initializeAssetList(generatedSeedPhrase, assetConfigs, user.id);

        const userAssetsData = createdAssetList.map((asset) => {
          if (isEvmAddress(asset.address)) {
            foundWallet.evmAddress = asset.address;
          }

          if (isAlgoAddress(asset.address)) {
            foundWallet.algoAddress = asset.address;
          }

          if (isBtcAddress(asset.address)) {
            foundWallet.btcAddress = asset.address;
          }

          const defaultAddress = asset?.address || asset?.addresses[0]?.address || null;
          return {
            userId: user.id,
            walletId: foundWallet.id,
            chainId: asset.chainId,
            configId: asset.assetId,
            assetName: asset.assetName,
            assetSymbol: asset.symbol,
            defaultAddress: asset?.address || asset?.addresses[0]?.address || null,
            userAssetAddress: defaultAddress,
            merchantId: user?.merchantId || null,
            addresses:
              asset?.addresses?.length > 0
                ? asset.addresses
                : [
                    {
                      type: 'DEFAULT',
                      address: asset.address,
                    },
                  ],
          };
        });

        await this.userAssetRepository
          .createQueryBuilder()
          .insert()
          .into(UserAsset)
          .values([...userAssetsData])
          .orUpdate({
            conflict_target: ['walletId', 'configId', 'defaultAddress'],
            overwrite: ['userAssetAddress', 'defaultAddress', 'assetName', 'assetSymbol'],
          })
          .orUpdate({
            conflict_target: ['merchantId', 'userId', 'walletId', 'configId', 'defaultAddress', 'ownershipType'],
            overwrite: ['userAssetAddress', 'defaultAddress', 'assetName', 'assetSymbol'],
          })
          .returning('*')
          .execute();
      }

      this.walletRepository.update(
        {
          id: foundWallet.id,
        },
        {
          assetsCount: foundWallet.userAssets.length,
          evmAddress: foundWallet.evmAddress,
          algoAddress: foundWallet.algoAddress,
          btcAddress: foundWallet.btcAddress,
        },
      );

      return {
        assets: foundWallet.userAssets,
        encryptedSeed: encryptedSeed,
        wallabyAuthPubKey: wallabyAuthPubKey,
        wallet: foundWallet,
      };
    }

    if (persistedAssetConfigs.length === 0) {
      throw new NotFoundException('No persistedAssetConfigs to create the wallet');
    }

    const foundRevision = await this.revisionRepository.findOne({ where: {} });

    if (!foundRevision) {
      throw new BadRequestException("Wallet can't be created without an active revision");
    }

    const assetConfigs = persistedAssetConfigs.map(({ config, chain }) => {
      return {
        name: config.name,
        chain: chain.slip44,
        derivationPath: chain.derivationPath,
        ticker: config.ticker,
        symbol: config.symbol,
        assetType: config.type,
        decimals: config.decimals,
        iconUrl: config.iconUrl,
        chainId: chain.id,
        assetName: config.name,
        assetId: config.id,
        rpcUrl: chain.mainnetRpcUrl,
      };
    });

    const wallet = await this.walletRepository.save({
      userId: user.id,
      revisionId: foundRevision.id,
      revisionName: foundRevision.name,
      hashedSeedPhrase: hashedSeedPhrase.data,
      hashedSeedPhraseSalt: hashedSeedPhrase.salt,
      merchantId: user?.merchantId || null,
    });

    const createdAssetList = await assetService.initializeAssetList(generatedSeedPhrase, assetConfigs, user.id);

    const userAssetsData = createdAssetList.map((asset) => {
      if (isEvmAddress(asset.address)) {
        wallet.evmAddress = asset.address;
      }

      if (isAlgoAddress(asset.address)) {
        wallet.algoAddress = asset.address;
      }

      if (isBtcAddress(asset.address)) {
        wallet.btcAddress = asset.address;
      }

      const defaultAddress = asset?.address || asset?.addresses[0]?.address || null;

      return {
        userId: user.id,
        walletId: wallet.id,
        configId: asset.assetId,
        chainId: asset.chainId,
        assetName: asset.assetName,
        assetSymbol: asset.symbol,
        defaultAddress,
        userAssetAddress: defaultAddress,
        merchantId: user?.merchantId || null,
        addresses:
          asset?.addresses?.length > 0
            ? asset.addresses
            : [
                {
                  type: 'DEFAULT',
                  address: asset.address,
                },
              ],
      };
    });

    await this.userAssetRepository
      .createQueryBuilder()
      .insert()
      .into(UserAsset)
      .values([...userAssetsData])
      .orUpdate({
        conflict_target: ['walletId', 'configId', 'defaultAddress'],
        overwrite: ['userAssetAddress', 'defaultAddress', 'assetName', 'assetSymbol'],
      })
      .orUpdate({
        conflict_target: ['merchantId', 'userId', 'walletId', 'configId', 'defaultAddress', 'ownershipType'],
        overwrite: ['userAssetAddress', 'defaultAddress', 'assetName', 'assetSymbol'],
      })
      .returning('*')
      .execute();

    // Increment the wallet count
    this.userRepository.increment(
      {
        id: user.id,
      },
      'walletsCount',
      1,
    );

    this.walletRepository.update(
      {
        id: wallet.id,
      },
      {
        assetsCount: userAssetsData.length,
        evmAddress: wallet.evmAddress,
        algoAddress: wallet.algoAddress,
        btcAddress: wallet.btcAddress,
      },
    );

    const encryptedSeed = await encryptWithPublicKey({
      publicKey: authGuardDto.clientAuthPubKey,
      text: generatedSeedPhrase,
    });

    const assets = await this.userAssetRepository.find({
      relations: ['config', 'merchant'],
      where: {
        walletId: wallet.id,
      },
    });

    const { wallabyAuthPubKey } = await this.authService.getWallabyAuthKeys(authGuardDto.clientAuthPubKey);
    if (!wallabyAuthPubKey) {
      throw new NotFoundException('The corresponding wallabyAuthPubKey could not be found');
    }

    return {
      wallabyAuthPubKey,
      encryptedSeed,
      wallet: omit(wallet, ['hashedSeedPhrase', 'hashedSeedPhraseSalt']),
      assets,
    };
  }

  async getWalletAssets(
    walletId: string,
    { chainName, symbol, isVisible, tokenStandard, groupBy, ...query }: GetWalletAssetQueryDto,
  ): Promise<GetUserAssetResponseDto> {
    const wallet = await this.walletRepository.findOne({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    const where: any = {
      walletId,
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

    if (tokenStandard) {
      where.config = {
        ...(where.config || {}),
        tokenStandard,
      };
    }

    if (typeof isVisible !== 'undefined') {
      where.isVisible = isVisible;
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

    // Update the wallet with missing default the addresses
    if (wallet.evmAddress !== evmAddress || wallet.algoAddress !== algoAddress || wallet.btcAddress !== btcAddress) {
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

  public async getUserAsset(getUserAssetRequestDto: GetUserAssetRequestDto, user: User): Promise<UserAssetDto> {
    const { blockchainName, assetSymbol } = getUserAssetRequestDto;

    const foundAssetConfig = await this.assetConfigRepository.findOne({
      relations: ['chain'],
      where: {
        symbol: assetSymbol,
        chainName: blockchainName,
      },
    });

    if (!foundAssetConfig) {
      throw new NotFoundException(`Asset config not found for ${blockchainName} and ${assetSymbol}`);
    }

    const foundUserAsset = await this.userAssetRepository.findOne({
      relations: ['config', 'merchant'],
      where: {
        userId: user.id,
        configId: foundAssetConfig.id,
      },
    });

    if (!foundUserAsset) {
      throw new NotFoundException(`User asset not found for ${blockchainName} and ${assetSymbol}`);
    }

    return foundUserAsset;
  }

  public async updateUserAsset(userAsset: UpdateUserAssetRequestDto, user: User): Promise<UpdateUserAssetResponseDto> {
    const foundUserAsset = await this.userAssetRepository.findOne({
      relations: ['config', 'merchant'],
      where: {
        walletId: userAsset.walletId,
        configId: userAsset.configId,
      },
    });

    if (!user.hasFullPermissions && user.merchantId !== foundUserAsset.merchantId) {
      throw new ForbiddenException({
        errorCode: ErrorResponseCodes.auth_user_not_allowed_to_perform_the_action,
        message: 'You are not allowed to perform this action',
      });
    }

    if (!foundUserAsset) {
      throw new NotFoundException({
        errorCode: ErrorResponseCodes.asset_not_found,
        message: `Asset with Config ID ${userAsset.configId} was not found in wallet: ${userAsset.walletId}`,
      });
    }

    await this.userAssetRepository.update(
      {
        walletId: userAsset.walletId,
        configId: userAsset.configId,
      },
      { isVisible: userAsset.isVisible },
    );

    foundUserAsset.isVisible = userAsset.isVisible;

    return {
      message: 'User asset was updated successfully',
      userAsset: foundUserAsset,
    };
  }

  private async generateEntropy() {
    const randBytes = await fetchRandomBytes({ size: 256 });
    const kmsEntropyBytes = randBytes.plaintext;

    const systemEntropy = lib.WordArray.random(128).words;
    const mixedEntropy = `${systemEntropy},${kmsEntropyBytes}`
      .split(',')
      .sort(() => 0.5 - Math.random())
      .map((value) => Number(value))
      .slice(0, 64);

    return Buffer.from(mixedEntropy).toString('hex').slice(0, 64);
  }

  public async createOrRetrieveMultisigAsset(
    multisigCreationRequestDto: MultisigCreationRequestDto,
  ): Promise<MultisigCreationResponseDto> {
    const { assetSymbol, tokenType } = multisigCreationRequestDto;

    const assetConfig = await this.assetConfigRepository.findOne({
      relations: ['chain'],
      where: {
        tokenStandard: tokenType,
        symbol: assetSymbol,
      },
    });

    if (!assetConfig) {
      throw new NotFoundException(
        `Could not find asset configuration with tokenType: ${tokenType} and assetSymbol: ${assetSymbol}`,
      );
    }

    const { participants, creatorAddress, threshold } = multisigCreationRequestDto;

    if (participants.length === 0) {
      throw new BadRequestException(`Multisig participants addresses should be provided`);
    }

    const uniqueParticipants: string[] = [
      ...new Set([...participants, multisigCreationRequestDto.creatorAddress]),
    ].sort();

    if (participants.length !== uniqueParticipants.length) {
      throw new BadRequestException(`Multisig participants should be unique and include the creator`);
    }

    if (uniqueParticipants.length < threshold) {
      throw new BadRequestException({
        message: `Multisig participants should match the threshold provided | uniqueParticipants: ${uniqueParticipants.length} threshold: ${threshold}`,
      });
    }

    const participantsAccounts: Array<Partial<UserAsset>> = await this.userAssetRepository
      .createQueryBuilder()
      .where({ defaultAddress: In(uniqueParticipants) })
      .distinctOn(['"defaultAddress"'])
      .getMany();

    // Cases where the participants assets were not yet persisted in the DB
    if (participantsAccounts.length === 0) {
      throw new ForbiddenException({
        errorCode: ErrorResponseCodes.auth_user_not_allowed_to_perform_the_action,
        message:
          'Multisig participants are required to have have accounts already inside the system - Please sign up, then proceed',
      });
    }

    const creatorAsset = participantsAccounts.find(
      (account) => account?.defaultAddress.toLowerCase() === creatorAddress.toLowerCase(),
    );

    switch (assetConfig.chain.slip44) {
      case ChainSlip44.ALGO: {
        const multiSigParams = {
          version: multisigCreationRequestDto.version,
          threshold: multisigCreationRequestDto.threshold,
          addrs: uniqueParticipants,
        };

        try {
          const createdMultisigAddress = algosdk.multisigAddress(multiSigParams);

          const foundChain = await this.chainRepository.findOne({
            where: {
              slip44: ChainSlip44.ALGO,
            },
          });

          const foundUserAssets = await this.userAssetRepository.find({
            relations: ['config', 'config.chain'],
            where: {
              defaultAddress: createdMultisigAddress,
              assetSymbol,
            },
          });

          const foundAssetConfig = foundUserAssets?.[0]?.config;

          // If asset exist, just returns it immediately
          if (foundUserAssets.length > 0) {
            return {
              message: `Multisig wallet address ${createdMultisigAddress} already exists`,
              asset: foundUserAssets.find((asset) => asset?.userId === creatorAsset?.userId) || foundUserAssets[0],
              assetConfig: foundAssetConfig,
            };
          }

          if (!foundChain) {
            throw new NotFoundException(`Slip 44 chain ${ChainSlip44.ALGO} not found`);
          }

          logger.log('Persisted multisig asset config: ', { foundAssetConfig });

          const newUserAssetData: Partial<UserAsset>[] = participantsAccounts.map(
            ({ userId, walletId, userAssetAddress, merchantId }: Partial<UserAsset>) => ({
              addresses: uniqueParticipants.map((address) => ({ address })),
              userId,
              userAssetAddress,
              walletId,
              configId: foundAssetConfig.id,
              defaultAddress: createdMultisigAddress,
              assetName: foundAssetConfig.name,
              ownershipType: OwnershipType.MULTI_SIG,
              chain: foundChain,
              assetSymbol: foundAssetConfig.symbol,
              merchantId,
            }),
          );

          const newUserAssets = await this.userAssetRepository
            .createQueryBuilder()
            .insert()
            .into(UserAsset)
            .values(newUserAssetData)
            .orUpdate({
              conflict_target: ['walletId', 'configId', 'defaultAddress'],
              overwrite: ['addresses', 'userAssetAddress', 'defaultAddress'],
            })
            .orUpdate({
              conflict_target: ['merchantId', 'userId', 'walletId', 'configId', 'defaultAddress', 'ownershipType'],
              overwrite: ['addresses', 'userAssetAddress', 'defaultAddress'],
            })
            .returning('*')
            .execute();

          const asset =
            newUserAssets?.raw?.find((asset) => asset?.userId === creatorAsset?.userId) || foundUserAssets[0];

          return {
            message: `Multisig wallet address ${asset.defaultAddress} has been created successfully`,
            asset,
            assetConfig: foundAssetConfig,
          };
        } catch (e) {
          logger.log(e);
          console.log(participants, e);
          throw new BadRequestException({
            message: e?.response?.asset
              ? e?.response?.message
              : 'Failed to create multi-sig, verify if all addresses are valid',
            asset: e?.response?.asset || undefined,
          });
        }
      }
      case ChainSlip44.BTC:
      case ChainSlip44.ETH:
      case ChainSlip44.AVAX:
      case ChainSlip44.MATIC:
      default: {
        logger.error('Chain not supported for multisig transactions', { multisigCreationRequestDto });
        throw new TypeError(`Chain not supported for multisig transactions: ${multisigCreationRequestDto.assetSymbol}`);
      }
    }
  }

  async initiateWalletRecovery({
    clientAuthPubKey,
    externalUserId,
  }: InitiateWalletRecoveryDto): Promise<InitiateWalletRecoveryResponseDto> {
    const foundUser = await this.userRepository.findOne({ where: { externalUserId } });

    if (!foundUser) {
      throw new NotFoundException('Wallet with corresponding user id does not exist');
    }

    const message = generateRandomBytes();

    const foundPublicKey = await this.publicKeyRepository.findOne({
      where: { publicKey: clientAuthPubKey },
    });

    if (foundPublicKey) {
      throw new ConflictException('Client public key already exist. Please use a new generated public key');
    }

    await this.authMessageRepository.save({
      message,
      clientAuthPubKey,
      userId: foundUser?.id,
    });

    return {
      signatureMessage: message,
      wallabyAuthPubKey: foundUser.latestWallabyAuthPubKey,
    };
  }

  public async recoverWallet(
    recoverWalletRequest: WalletCompleteRecoveryCodeDto,
  ): Promise<WalletCompleteRecoveryCodeResponseDto> {
    const { externalUserId, encryptedSeed, clientAuthPubKey } = recoverWalletRequest;
    const foundUser = await this.userRepository.findOne({
      where: { externalUserId },
    });

    if (!foundUser) {
      throw new NotFoundException("The user reference wasn't found");
    }

    if (!foundUser?.hashingSalt) {
      throw new BadRequestException("The wallet can't be recovered");
    }

    const foundPublicKey = await this.publicKeyRepository.findOne({
      where: { publicKey: clientAuthPubKey },
    });

    if (foundPublicKey) {
      throw new ConflictException("You can't use an old public key");
    }

    await this.publicKeyRepository.save({
      publicKey: clientAuthPubKey,
      userId: foundUser.id,
    });

    const { keyPair } = await fetchWallabyAuthKeys({ userId: foundUser.id });

    if (!keyPair?.privateKey) {
      throw new BadRequestException({ message: 'The corresponding wallaby auth keys could not be found.' });
    }

    const seedPhrase = await decryptWithPrivateKey({
      ciphertext: encryptedSeed,
      privateKey: keyPair.privateKey,
    });

    if (!seedPhrase) {
      const message = 'The provided seed phrase could not be decrypted';
      logger.error(message, {
        clientAuthPubKey,
        externalUserId,
        keyPair: pick(keyPair, ['publicKey']),
        foundUser: pick(foundUser, ['id', 'externalUserId']),
      });

      throw new BadRequestException({ message });
    }

    const { walletAddress } = await getEVMWalletAddressFromSeed(seedPhrase);

    if (!walletAddress) {
      throw new BadRequestException({ message: 'The provided seed phrase is incorrect' });
    }

    const hash = await cryptographer.computeHash({
      data: seedPhrase,
      salt: foundUser.hashingSalt,
    });

    let foundWallet = await this.walletRepository.findOne({
      relations: ['userAssets'],
      where: {
        hashedSeedPhrase: hash.data,
        userId: foundUser.id,
      },
    });

    if (!foundWallet) {
      const foundAllWallets = await this.walletRepository.find({
        where: {
          evmAddress: walletAddress,
        },
      });

      foundWallet = foundAllWallets.find((wallet) => wallet?.userId === foundUser.id);

      if (!foundWallet) {
        const message = 'The wallet could not be found with the provided seed phrase';
        logger.error(message, {
          clientAuthPubKey,
          externalUserId,
          keyPair: pick(keyPair, ['publicKey']),
          foundUser: pick(foundUser, ['id', 'externalUserId']),
          walletAddress,
          foundAllWallets: foundAllWallets.map((wallet) => pick(wallet, ['id', 'userId', 'evmAddress', 'createdAt'])),
        });

        throw new NotFoundException({ message });
      }
    }

    if (foundWallet?.userId !== foundUser.id) {
      const foundDeprecatedWallet = await this.walletRepository.findOne({
        where: {
          userId: foundUser.id,
          createdAt: LessThan(dayjs(process.env.DEPRECATED_WALLET_HASH_DATE || '2023-08-11').format()), // The date when the seed phrase hashing algorithm was deployed
        },
      });

      if (foundDeprecatedWallet && foundDeprecatedWallet.recoveryCount === 0) {
        await this.walletRepository.update(
          {
            id: foundDeprecatedWallet.id,
          },
          {
            hashedSeedPhrase: hash.data,
            hashedSeedPhraseSalt: hash.salt,
            recoveryCount: 1,
          },
        );

        return {
          user: {
            id: foundUser.id,
            externalUserId: foundUser.externalUserId,
          },
          wallet: foundDeprecatedWallet,
        };
      }

      const message = "The wallet and user don't match";
      logger.error(message, {
        wallet: pick(foundWallet, ['id', 'userId', '']),
        user: pick(foundUser, ['id', 'externalUserId', 'hashingSalt']),
        hash,
      });
      throw new BadRequestException({ message });
    }

    // Increment the recovery count
    this.walletRepository.increment(
      {
        id: foundWallet.id,
      },
      'recoveryCount',
      1,
    );

    return {
      user: {
        id: foundUser.id,
        externalUserId: foundUser.externalUserId,
      },
      wallet: foundWallet,
    };
  }

  public async convertStandardPhraseToAlgoSpecificPhrase(
    mnemonicConversionRequest: MnemonicConversionToAlgoSpecificRequestDto,
  ): Promise<MnemonicConversionToAlgoSpecificResponseDto> {
    const algoSigner = new AlgoTransactionSigner();
    const { encryptedSeed } = mnemonicConversionRequest;

    const { clientAuthPubKey } = mnemonicConversionRequest;

    const foundClientPubKey = await this.publicKeyRepository.findOne({
      where: { publicKey: clientAuthPubKey },
    });

    if (!foundClientPubKey) {
      throw new UnauthorizedException({
        message: `Unauthorized mnemonic phrase conversion | reference: ${mnemonicConversionRequest.reference}`,
      });
    }

    const seedPhrase = await decryptSeedPhrase({
      userId: foundClientPubKey.userId,
      encryptedSeedPhrase: encryptedSeed,
    });

    if (!seedPhrase) {
      throw new BadRequestException({
        message: `The seed phrase could not be decrypted. Wrong format or tampered | reference: ${mnemonicConversionRequest.reference}`,
      });
    }

    const convertedSeed = algoSigner.getSigningKeyAndConvertedSeed(seedPhrase);
    const encryptedConvertedSeed = await encryptWithPublicKey({
      publicKey: clientAuthPubKey,
      text: convertedSeed.mnemonic,
    });

    return {
      reference: mnemonicConversionRequest.reference,
      convertedEncryptedSeed: encryptedConvertedSeed,
    };
  }

  async getAllWallets(query: GetAllWalletsRequestDto): Promise<GetAllWalletsResponseDto> {
    const { user } = this.request;

    const { evmAddress, algoAddress, btcAddress, userId, walletId } = query;

    const where: any = {};

    if (algoAddress) {
      where.algoAddress = algoAddress;
    }

    if (evmAddress) {
      where.evmAddress = evmAddress;
    }

    if (btcAddress) {
      where.btcAddress = btcAddress;
    }

    if (walletId) {
      where.id = walletId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (user.role === UserRole.MERCHANT_ADMIN) {
      where['merchantId'] = user.merchantId;
    }

    const { records, pagination } = await paginateRecord({
      relations: ['user'],
      select: {
        user: {
          id: true,
          externalUserId: true,
        },
      },
      ...query,
      repository: this.walletRepository,
    });

    return {
      wallets: records,
      pagination,
    };
  }
}

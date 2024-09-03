import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsEnum,
  IsUUID,
  IsNumber,
  IsOptional,
  IsObject,
  MinLength,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import {
  AssetType,
  TokenStandard,
  AssetConfigStatus,
  AddressType,
  ChainName,
  GroupedAssets,
} from '@modules/asset/models/asset.models';
import { testAccount } from '@test/data/accounts';
import { UserAsset } from '@modules/user/user-asset.entity';
import { AuthGuardDto, EncryptedDataInterface } from '@modules/auth/auth.dto';
import { AssetConfig } from '@modules/asset/asset-config.entity';
import { Wallet } from './wallet.entity';
import { PaginationQueryDto, PaginationResponseDto } from '@modules/user/pagination.dto';
import { Merchant } from '@modules/merchant/merchant.entity';

export class AssetConfigDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  chainId: string;

  @ApiProperty()
  chainName: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  symbol: string;

  @ApiProperty()
  decimals: number;

  @ApiProperty()
  @IsOptional()
  iconUrl?: string;

  @ApiProperty()
  @IsOptional()
  ticker?: string;

  @ApiProperty({
    enum: AssetType,
  })
  type: AssetType;

  @ApiProperty({
    enum: TokenStandard,
    example: TokenStandard.ERC_20,
    description:
      'Optional value only used when dealing with non native assets (aka tokens), it can be ERC_20, BEP_20, ALGO_STANDARD, ALGO_APP. If native asset, keep the field empty',
  })
  @IsOptional()
  tokenType: TokenStandard;

  @ApiProperty()
  description?: string;

  @ApiProperty({ enum: AssetConfigStatus, example: AssetConfigStatus[AssetConfigStatus.active] })
  status?: AssetConfigStatus;
}

export class UserAssetAddress {
  @ApiProperty()
  @IsString()
  address: string;

  @ApiProperty({
    example: testAccount.publicKey,
  })
  @IsString()
  publicKey: string;

  @ApiProperty({ enum: AddressType, example: AddressType[AddressType.SEGWIT] })
  @IsEnum(AddressType)
  type: AddressType;
}

export class UserAssetDto extends UserAsset {
  @ApiProperty({
    type: AssetConfig,
  })
  @Type(() => AssetConfig)
  config: AssetConfig;

  @Type(() => Merchant)
  // Only making limited fields accessible to the user
  merchant: Pick<Merchant, 'id' | 'name' | 'nameSlugify' | 'verified' | 'status'>;
}

export class WalletCreateRequest {
  @ApiProperty({
    description: 'The user uuid',
    example: 'a4dedb83-4d59-41ca-84b5-4b24a98878d8',
  })
  @IsString()
  userId: string;
}

export class WalletDto {
  @ApiProperty({
    description: 'Wallet ID',
    example: '73d642c9-6762-421b-8f7b-5393cb220791',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The user uuid',
    example: 'a4dedb83-4d59-41ca-84b5-4b24a98878d8',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Wallet revision ID',
    example: 'v1',
  })
  @IsString()
  revisionName: string;
}

export class GetUserAssetResponseDto extends PaginationResponseDto {
  @ApiProperty({
    isArray: true,
    description: 'User Assets',
    type: UserAssetDto,
  })
  @IsArray({ each: true })
  @Type(() => UserAssetDto)
  assets: UserAssetDto[];
  @ApiProperty({
    description: 'Grouped User assets, will be returned if groupBy query param is provided',
  })
  @IsArray({ each: true })
  groupedAssets?: GroupedAssets[];
}

export class GetUserAssetRequestDto {
  @ApiProperty({
    description: 'Asset symbol',
    example: 'ETH',
  })
  @IsString()
  assetSymbol: string;

  @ApiProperty({
    enum: ChainName,
    description: 'Asset symbol',
    example: ChainName.ETHEREUM,
  })
  @IsEnum(ChainName)
  blockchainName: ChainName;
}

export class UpdateUserAssetRequestDto {
  @ApiProperty({
    description: 'Config ID',
    example: '6e464058-67c1-4273-a6a4-8aae522e34be',
  })
  @IsString()
  configId: string;

  @ApiProperty({
    description: 'Asset name',
    example: 'Ethereum',
  })
  @IsString()
  @IsOptional()
  assetName: string;

  @ApiProperty({
    description: 'Asset symbol',
    example: 'ETH',
  })
  @IsString()
  @IsOptional()
  assetSymbol: string;

  @ApiProperty({
    description: 'Visibility',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isVisible: boolean;

  @ApiProperty({
    required: true,
    description: 'Wallet ID',
    example: '6e464058-67c1-4273-a6a4-8aae522e34be',
  })
  @IsUUID()
  walletId: string;
}

export class UpdateUserAssetResponseDto {
  @ApiProperty({
    description: 'Updated User Asset',
    type: UserAssetDto,
  })
  @Type(() => UserAssetDto)
  userAsset: UserAssetDto;

  @ApiProperty({
    example: 'Asset was updated successfully',
  })
  @IsString()
  message: string;
}

export class WalletCreatedDto {
  @ApiProperty({
    description: 'Wallaby Auth Pub Key',
    example: testAccount.privateKey,
  })
  @IsString()
  @IsOptional()
  wallabyAuthPubKey?: string;

  @ApiProperty({
    isArray: true,
    description: 'User Assets',
    type: UserAssetDto,
  })
  @IsArray({ each: true })
  @Type(() => UserAssetDto)
  assets: UserAssetDto[];

  @ApiProperty({
    description: 'Single Wrapper Encrypted seed phrase encrypted with its corresponding wallabyAuthPubKey',
    example: testAccount.phraseEncrypted,
    type: EncryptedDataInterface,
  })
  @IsObject()
  @Type(() => EncryptedDataInterface)
  encryptedSeed: EncryptedDataInterface;

  @ApiProperty({
    description: 'Wallet Info',
  })
  @Type(() => WalletDto)
  wallet: WalletDto;
}

export class GetWalletAssetQueryDto extends PaginationQueryDto {
  @ApiProperty({
    enum: ChainName,
    required: false,
  })
  @IsEnum(ChainName)
  @IsOptional()
  chainName: ChainName;

  @ApiProperty({
    example: 'ETH',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  symbol: string;

  @ApiProperty({
    required: false,
    description: 'Asset visibility status',
  })
  @IsBoolean()
  @IsOptional()
  isVisible: boolean;

  @ApiProperty({
    required: false,
    description: 'Token Standard',
  })
  @IsEnum(TokenStandard)
  @IsOptional()
  tokenStandard?: TokenStandard;

  @ApiProperty({
    required: false,
    description: 'Group By a specific field',
    example: 'config.chainName will return the assets grouped by chainName',
  })
  @IsString()
  @IsOptional()
  groupBy?: string;
}

export class GetWalletAssetParamDto {
  @ApiProperty({
    description: 'Wallet ID',
  })
  @IsUUID()
  walletId: string;
}

export class MultisigCreationRequestDto {
  @ApiProperty({
    description: 'Asset symbol',
    example: 'ALGO',
  })
  @IsString()
  assetSymbol: string;

  @ApiProperty({
    enum: TokenStandard,
    example: TokenStandard.ALGO_STANDARD,
    description:
      'Optional value only used when dealing with non native assets (aka tokens), it can be ERC_20, BEP_20, ALGO_STANDARD, ALGO_APP. If native asset, keep the field empty',
  })
  @IsEnum(TokenStandard)
  @IsOptional()
  tokenType: TokenStandard;

  @ApiProperty({
    description: 'Version of the multi-sig',
    example: 1,
  })
  @IsNumber()
  version: number;

  @ApiProperty({
    description: 'The threshold of the multi-sig',
    example: 2,
  })
  @IsNumber()
  threshold: number;

  @ApiProperty({
    description: 'The address of the account that is initiating the multisig asset creation',
    example: 'GR45UFDRAHU6AZ7FPWNUS52BN7ETV2WBR2CXCY44AIRMUCSIVN7MLYOWBM',
  })
  @IsString()
  creatorAddress: string;

  @ApiProperty({
    description: 'The array containing the addresses of the users requested to participate in the multisig',
    example: [
      'LEECDQ7TZEN332SCXPGDU6LOEHUYBFMPEMOMY27GJMK57X5UV4D56YSKX4',
      'ZW3ISEHZUHPO7OZGMKLKIIMKVICOUDRCERI454I3DB2BH52HGLSO67W754',
    ],
  })
  @IsArray()
  participants: Array<string>;
}

export class MultisigCreationResponseDto {
  @ApiProperty({
    example: 'Multisig wallet created successfully',
  })
  message?: string;

  @ApiProperty({})
  @Type(() => AssetConfig)
  assetConfig: AssetConfig;

  @ApiProperty({})
  @Type(() => UserAsset)
  asset?: UserAsset;
}

export class InitiateWalletRecoveryDto {
  @ApiProperty({
    description: 'User reference UUID',
    example: testAccount.externalUserId,
  })
  @IsUUID()
  externalUserId: string;

  @ApiProperty({
    example: testAccount.publicKey,
  })
  @IsString()
  @MinLength(128)
  @MaxLength(256)
  clientAuthPubKey: string;
}

export class InitiateWalletRecoveryResponseDto {
  @ApiProperty({
    example: '6e46405867c14273a6a48aae522e34be',
  })
  @IsString()
  signatureMessage: string;

  @ApiProperty({
    example: testAccount.wallabyAuthPubKey,
  })
  @IsString()
  wallabyAuthPubKey: string;
}

export class WalletCompleteRecoveryCodeDto {
  @ApiProperty({
    description: 'User ID from the Republic',
    example: testAccount.externalUserId,
  })
  @IsUUID()
  externalUserId: string;

  @ApiProperty({
    example: testAccount.publicKey,
  })
  @IsString()
  @MinLength(128)
  @MaxLength(256)
  clientAuthPubKey: string;

  @ApiProperty({
    description: 'Message retrieved from the backend',
    example: '717ea458b62a430cb37ced7c22ebec97',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: `Signature generated after signing the provided data field`,
    example: testAccount.signature,
  })
  @IsString()
  signature: string;

  @ApiProperty({
    description: 'Encrypted seed phrase with its corresponding wallabyAuthPubKey',
    example: {
      iv: '02aeac54cb45283b427bd1a5028552c1',
      ephemPublicKey: '044acf39ed83c304f19f41ea66615d7a6c0068d5fc48ee181f2fb1091...',
      ciphertext: '5fbbcc1a44ee19f7499dbc39cfc4ce96',
      mac: '96490b293763f49a371d3a2040a2d2cb57f246ee88958009fe3c7ef2a38264a1',
    },
    type: EncryptedDataInterface,
  })
  @IsObject()
  @Type(() => EncryptedDataInterface)
  encryptedSeed: EncryptedDataInterface;
}

export class WalletCompleteRecoveryCodeResponseDto {
  @ApiProperty({
    description: 'Wallaby user',
    example: {
      userId: 'a4dedb83-4d59-41ca-84b5-4b24a98878d8',
      externalUserId: 'de86cbd2-aef6-45b1-9f9e-f75013a13381',
    },
  })
  @IsObject()
  user: { id: string; externalUserId: string };

  @ApiProperty({
    description: 'Recovered wallet',
    type: Wallet,
  })
  @Type(() => Wallet)
  wallet: Wallet;
}

export class MnemonicConversionToAlgoSpecificRequestDto extends AuthGuardDto {
  @ApiProperty({
    description: 'Request reference, random UUID value',
    example: 'a4dedb83-4d59-41ca-84b5-4b24a98878d8',
  })
  @IsString()
  reference: string;

  @ApiProperty({
    description:
      'Seed encrypted asymmetrically by current user corresponding wallaby auth public key, to be decrypted inside the secure code execution environment',
    example: testAccount.phraseEncrypted,
    type: EncryptedDataInterface,
  })
  @IsObject()
  @Type(() => EncryptedDataInterface)
  encryptedSeed: EncryptedDataInterface;
}

export class WalletSeedImportRequestDto extends AuthGuardDto {
  @ApiProperty({
    description:
      'Seed encrypted asymmetrically by current user corresponding wallaby auth public key, to be decrypted inside the secure code execution environment',
    example: testAccount.phraseEncrypted,
    type: EncryptedDataInterface,
  })
  @IsObject()
  @Type(() => EncryptedDataInterface)
  encryptedSeed: EncryptedDataInterface;
}

export class MnemonicConversionToAlgoSpecificResponseDto {
  @ApiProperty({
    description: 'Request reference, random UUID value',
    example: 'a4dedb83-4d59-41ca-84b5-4b24a98878d8',
  })
  @IsString()
  reference: string;

  @ApiProperty({
    description: 'Seed encrypted asymmetrically by current user corresponding wallaby auth public key',
    example: testAccount.phraseEncrypted,
    type: EncryptedDataInterface,
  })
  @IsObject()
  @Type(() => EncryptedDataInterface)
  convertedEncryptedSeed: EncryptedDataInterface;
}

export class GetAllWalletsRequestDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'User Id',
  })
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'Wallet Id',
  })
  @IsUUID()
  walletId?: string;

  @ApiProperty({
    description: 'EVM Address',
  })
  @IsString()
  evmAddress?: string;

  @ApiProperty({
    description: 'BTC Address',
  })
  @IsString()
  btcAddress?: string;

  @ApiProperty({
    description: 'ALGO Address',
  })
  @IsString()
  algoAddress?: string;
}

export class GetAllWalletsResponseDto extends PaginationResponseDto {
  @ApiProperty({
    description: 'Users public data',
    type: Wallet,
    isArray: true,
  })
  @IsArray({ each: true })
  wallets: Wallet[];
}

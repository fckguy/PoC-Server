import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsEmail, IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';
import { Wallet } from '@modules/wallet/wallet.entity';
import { Transform, Type } from 'class-transformer';
import { AuthGuardDto } from '@modules/auth/auth.dto';
import { MultisigParticipantStatus } from '@modules/transactions/multisigParticipant.entity';
import { Transaction } from '@modules/transactions/transaction.entity';
import { UserAsset } from './user-asset.entity';
import { User, UserRole } from './user.entity';
import { testAccount } from '@test/data/accounts';
import { PaginationQueryDto, PaginationResponseDto } from './pagination.dto';
import { ChainName, TokenStandard, GroupedAssets } from '@modules/asset/models/asset.models';
import { AssetConfig } from '@modules/asset/asset-config.entity';

export class UserDto {
  @ApiProperty({
    description: 'User primary key',
  })
  id: string;

  @ApiProperty({
    description: 'External User ID for Reference',
    example: testAccount.externalUserId,
  })
  externalUserId: string;

  @ApiProperty({
    description: 'Merchant ID',
    example: testAccount.externalUserId,
    required: false,
  })
  @IsUUID()
  @IsOptional()
  merchantId?: string;

  @ApiProperty({
    description: 'User first name',
    example: 'Bryan',
  })
  firstName?: string;

  @ApiProperty({
    example: UserRole.WALLET_USER,
    enum: UserRole,
  })
  role?: UserRole;

  @ApiProperty({
    description: "User's wallets count",
    example: 1,
  })
  walletsCount: number;

  @ApiProperty({
    description: 'Latest generated wallaby auth pub key',
    example: testAccount.wallabyAuthPubKey,
  })
  latestWallabyAuthPubKey?: string;

  @ApiProperty({
    description: 'Latest generated wallaby auth pub key version',
    example: '1',
  })
  latestWallabyAuthPubKeyVersion?: string;
}
export class QueryUserWalletsDto {
  @ApiProperty({
    description: 'Wallet User ID',
  })
  @IsUUID()
  userId: string;
}

export class GetUserAssetsByUserIdParamDto {
  @ApiProperty({
    description: 'User ID',
  })
  @IsUUID()
  userId: string;
}

export class GetUserAssetsByUserIdQueryDto extends PaginationQueryDto {
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

export class AddUserAssetQueryDto {
  @ApiProperty({
    description: 'User ID',
  })
  @IsUUID()
  assetId: string;
}

export class AddUserAssetDto {
  @ApiProperty({
    description: 'Asset Config ID',
  })
  @IsUUID()
  @IsOptional()
  assetConfigId?: string;

  @ApiProperty({
    description: 'User Wallet ID',
  })
  @IsUUID()
  walletId: string;

  @ApiProperty({
    description: 'User ID',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    type: AssetConfig,
    required: false,
  })
  @IsOptional()
  @Type(() => AssetConfig)
  config?: Partial<AssetConfig>;
}

export class AddUserAssetResponseDto {
  @ApiProperty({
    description: 'User Asset',
    type: UserAsset,
  })
  @Type(() => UserAsset)
  asset: UserAsset;
}

export class GetUserAssetsByUserIdResponseDto extends PaginationResponseDto {
  @ApiProperty({
    isArray: true,
    description: 'User Assets',
    type: UserAsset,
  })
  @IsArray({ each: true })
  @Type(() => UserAsset)
  assets: UserAsset[];
  @ApiProperty({
    description: 'Grouped assets list',
  })
  @IsArray({ each: true })
  groupedAssets?: GroupedAssets[];
}

export class UserWalletsResponseDto {
  @ApiProperty({
    isArray: true,
    description: 'User Wallets',
    type: Wallet,
  })
  @IsArray({ each: true })
  @Type(() => Wallet)
  wallets: Wallet[];
}

export class GetUserByIdResponseDto {
  @ApiProperty({
    description: 'User public data',
    type: UserDto,
  })
  @Type(() => UserDto)
  user: UserDto;
}

export class GetUserByIdResponseQueryDto {
  @ApiProperty({
    description: 'Wallet User ID',
  })
  @IsUUID()
  userId: string;
}

export class GetUserByExternalUserIdResponseDto extends GetUserByIdResponseDto {}
export class GetUserByExternalUserIdResponseQueryDto {
  @ApiProperty({
    description: 'externalUserId provided on sign up',
  })
  @IsUUID()
  externalUserId: string;
}
export class UpdateProfileDto extends AuthGuardDto {
  @ApiProperty({
    description: "User's email",
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: "User's first name",
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: "User's last name",
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class UpdateProfileResponseDto {
  @ApiProperty({
    description: 'Response message',
  })
  @IsString()
  message: string;

  @ApiProperty({
    description: "User's updated data",
    type: User,
  })
  @IsOptional()
  @Type(() => UserDto)
  user: UserDto;
}

export class GetParticipantsByUserIdResponseDto {
  @ApiProperty({
    description: 'The list of multisig transaction by participant user id',
    type: Transaction,
    isArray: true,
  })
  @IsArray({ each: true })
  multisigTransactions: Transaction[];
}

export class GetParticipantsByUserIdParamDto {
  @ApiProperty({
    description: 'User ID',
  })
  @IsUUID()
  userId: string;
}

export class GetParticipantsByUserIdQueryDto {
  @ApiProperty({
    description: 'Participant approval status',
    enum: MultisigParticipantStatus,
    required: false,
    default: MultisigParticipantStatus.PENDING_APPROVAL,
  })
  @IsEnum(MultisigParticipantStatus)
  @IsOptional()
  status?: MultisigParticipantStatus;
}

export class UserSaltResponseDto {
  @ApiProperty({
    description: 'User Client salt',
  })
  clientSalt: string;
}

export class RemoveUserFromUserQueryDto {
  @ApiProperty({
    description: 'Asset Config ID',
  })
  @IsUUID()
  assetConfigId: string;

  @ApiProperty({
    description: 'User Wallet ID',
  })
  @IsUUID()
  walletId: string;

  @ApiProperty({
    description: 'User ID',
  })
  @IsUUID()
  userId: string;
}

export class RemoveUserFromUserResponseDto {
  @ApiProperty({
    example: 'Asset was successfully removed from user',
    description: 'Response message',
  })
  message: string;
}

export class GetAllUsersResponseDto extends PaginationResponseDto {
  @ApiProperty({
    description: 'Users public data',
    type: UserDto,
    isArray: true,
  })
  @IsArray({ each: true })
  users: UserDto[];
}

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  EntityRepository,
  Repository,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { AssetConfig } from '@modules/asset/asset-config.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OwnershipType } from '@modules/asset/models/asset.models';
import { Merchant } from '@modules/merchant/merchant.entity';
import { Wallet } from '@modules/wallet/wallet.entity';

export enum UserAssetSource {
  MERCHANT = 'merchant',
  USER = 'user',
  REPUBLIC = 'republic',
}

const tableName = 'users_assets';
@Entity(tableName)
export class UserAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  @ApiProperty({
    description: 'Wallet user ID',
  })
  userId: string | null;

  @Column({ type: 'uuid' })
  @ApiProperty({
    description: 'Merchant ID',
  })
  merchantId: string | null;

  @Column({ type: 'uuid' })
  @ApiProperty({
    description: 'Chain ID',
  })
  chainId: string | null;

  @Column({ type: 'varchar', nullable: true })
  @ApiProperty({
    description: 'User asset address',
  })
  userAssetAddress: string | null;

  @ApiProperty({
    description: 'Wallet ID',
  })
  @Column({ type: 'uuid', nullable: true })
  walletId: string | null;

  @ApiProperty({
    description: 'Asset ID',
  })
  @Column({ type: 'uuid', nullable: false })
  configId: string;

  @ApiProperty({
    description: 'Asset Name',
  })
  @Column({ type: 'varchar', nullable: false })
  assetName: string;

  @ApiProperty({
    description: 'Asset Symbol',
  })
  @Column({ type: 'varchar', nullable: false })
  assetSymbol: string;

  @ApiProperty({
    description: 'Asset Persisted Balance',
  })
  @Column({ type: 'float8' })
  balance: string;

  @ApiProperty({
    description: 'Asset Persisted Balance',
  })
  @Column({ type: 'timestamp', default: null })
  balanceUpdatedAt: Date | string | null;

  @ApiProperty({
    description: 'Asset Persisted Locked Balance',
  })
  @Column({ type: 'float8' })
  lockedTokenBalance: string;

  @ApiProperty({
    description: 'Asset Persisted Balance',
  })
  @Column({ type: 'timestamp', default: null })
  lockedTokenBalanceUpdatedAt: Date | string | null;

  @ApiProperty({
    description: 'Asset Default Address',
  })
  @Column({ type: 'varchar', nullable: false })
  defaultAddress: string;

  @ApiProperty({
    description: 'Asset Visibility',
  })
  @Column({ type: 'bool', default: true })
  isVisible: boolean;

  @Column({ type: 'tsvector', select: false })
  search: string;

  @ApiProperty({
    description: 'Asset Import Source',
    enum: UserAssetSource,
  })
  @Column({ type: 'varchar', nullable: false, default: UserAssetSource.MERCHANT })
  source: UserAssetSource;

  @ApiProperty({
    description: 'Addresses',
  })
  @Column({ type: 'simple-json', array: false })
  addresses: Array<{ address: string; publicKey?: string; type?: string }>;

  @ApiProperty({
    description: 'The field differentiate multisig transaction',
  })
  @Column({ type: 'varchar', default: OwnershipType.SINGLE_OWNER })
  ownershipType: OwnershipType;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date | string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date | string;

  @ManyToOne(() => AssetConfig, (assetConfig: AssetConfig) => assetConfig.usersAssets)
  @JoinColumn()
  config: AssetConfig;

  @ManyToOne(() => Wallet, (wallet: Wallet) => wallet.userAssets)
  @JoinColumn()
  wallet: Wallet;

  @ManyToOne(() => Merchant, (record: Merchant) => record.usersAssets)
  @JoinColumn()
  // Limiting the fields accessed by the user
  merchant: Pick<Merchant, 'id' | 'name' | 'nameSlugify' | 'verified' | 'status'>;
}

@EntityRepository(UserAsset)
export class UserAssetRepository extends Repository<UserAsset> {}

import {
  Column,
  Entity,
  EntityRepository,
  Repository,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/user/user.entity';
import { Merchant } from '@modules/merchant/merchant.entity';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { UserAsset } from '@modules/user/user-asset.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Wallet ID',
  })
  id: string;

  @Column({ type: 'uuid', nullable: false })
  @ApiProperty({
    description: 'Wallet user ID',
  })
  userId: string;

  @Column({ type: 'uuid' })
  @ApiProperty({
    description: 'Merchant ID',
  })
  merchantId: string;

  @Column({ type: 'int8', nullable: false })
  @ApiProperty({
    description: 'Wallet revision number',
  })
  revisionId: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({
    description: 'Wallet revision name',
  })
  revisionName: string;

  @ApiProperty({
    description: 'The default EVM address',
  })
  @Column({ type: 'varchar' })
  evmAddress: string;

  @ApiProperty({
    description: 'The default BTC address',
  })
  @Column({ type: 'varchar' })
  btcAddress: string;

  @ApiProperty({
    description: 'The default Algo address',
  })
  @Column({ type: 'varchar' })
  algoAddress: string;

  @Column({ type: 'varchar', select: false })
  hashedSeedPhrase: string;

  @Column({ type: 'varchar', select: false })
  hashedSeedPhraseSalt: string;

  @Column({ type: 'int2', default: 0 })
  recoveryCount: number;

  @ApiProperty({
    description: 'Total number of assets in the wallet',
  })
  @Column({ type: 'int4', default: 0 })
  assetsCount: number;

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

  @ManyToOne(() => User, (user: User) => user.wallets)
  @JoinColumn()
  user: User;

  @ApiProperty({
    type: UserAsset,
  })
  @Type(() => UserAsset)
  @JoinColumn()
  @IsOptional()
  @OneToMany(() => UserAsset, (record: UserAsset) => record.wallet)
  userAssets?: UserAsset[];

  @ApiProperty({
    type: Merchant,
  })
  @Type(() => Merchant)
  @IsOptional()
  @ManyToOne(() => Merchant, (record: Merchant) => record.apiKeys)
  @JoinColumn()
  merchant?: Merchant;
}

@EntityRepository(Wallet)
export class WalletRepository extends Repository<Wallet> {}

import {
  Column,
  Entity,
  EntityRepository,
  Repository,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuthPublicKey } from '@modules/auth-public-key/auth-public-key.entity';
import { Wallet } from '@modules/wallet/wallet.entity';
import { ApiProperty } from '@nestjs/swagger';
import { testAccount } from '@test/data/accounts';
import { Merchant } from '@modules/merchant/merchant.entity';
import { AssetConfig } from '@modules/asset/asset-config.entity';
import { UserOtp } from '@modules/auth/user-otp.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  REPUBLIC_ADMIN = 'republic_admin',
  MERCHANT_ADMIN = 'merchant_admin',
  WALLET_USER = 'wallet_user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'User primary key',
  })
  id: string;

  @Column({ type: 'uuid', nullable: false })
  @ApiProperty({
    description: 'External User ID for Reference',
    example: testAccount.externalUserId,
  })
  externalUserId: string;

  @Column({ type: 'uuid' })
  @ApiProperty({
    description: 'Merchant ID',
    example: testAccount.externalUserId,
  })
  merchantId: string;

  @Column({ type: 'varchar' })
  @ApiProperty({
    description: 'User Role ID',
    example: UserRole.REPUBLIC_ADMIN,
    enum: UserRole,
  })
  role: UserRole | null;

  @Column({ type: 'varchar' })
  email?: string;

  @Column({ type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar' })
  passwordSalt: string;

  @Column({ type: 'bool', default: false })
  emailVerified?: boolean;

  @ApiProperty({
    description: 'User first name',
    example: 'Bryan',
  })
  @Column({ type: 'varchar' })
  firstName?: string;

  @Column({ type: 'varchar' })
  lastName?: string;

  @Column({ type: 'tsvector', select: false })
  search: string;

  @Column({ type: 'varchar' })
  hashingSalt?: string;

  @Column({ type: 'varchar' })
  clientSalt?: string;

  @Column({ type: 'int4' })
  @ApiProperty({
    description: 'User wallets count',
    example: 2,
  })
  walletsCount: number;

  @Column({ type: 'varchar' })
  @ApiProperty({
    description: 'Latest generated wallaby auth pub key',
    example: testAccount.wallabyAuthPubKey,
  })
  latestWallabyAuthPubKey?: string;

  @Column({ type: 'varchar' })
  @ApiProperty({
    description: 'Latest generated wallaby auth pub key version',
    example: '1',
  })
  latestWallabyAuthPubKeyVersion?: string;

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

  @OneToMany(() => AuthPublicKey, (publicKey: AuthPublicKey) => publicKey.user)
  authPublicKeys: AuthPublicKey[];

  @OneToMany(() => Wallet, (wallet: Wallet) => wallet.user)
  wallets?: Wallet[];

  @ManyToOne(() => Merchant, (record: Merchant) => record.apiKeys)
  @JoinColumn()
  merchant: Merchant;

  @OneToMany(() => AssetConfig, (record: AssetConfig) => record.createdByUser)
  createdAssets?: AssetConfig[];

  @OneToMany(() => UserOtp, (record: UserOtp) => record.user)
  otps?: UserOtp[];

  @ApiProperty({
    example: true,
    description: 'User roles with full permissions',
  })
  get hasFullPermissions(): boolean {
    return this.role === UserRole.SUPER_ADMIN || this.role === UserRole.REPUBLIC_ADMIN;
  }
}

@EntityRepository(User)
export class UserRepository extends Repository<User> {}

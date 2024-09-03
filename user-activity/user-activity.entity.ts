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
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/user/user.entity';
import { Merchant } from '@modules/merchant/merchant.entity';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export enum UserActivityAction {
  LOGGED_IN = 'logged_in',
  LOGGED_OUT = 'logged_out',
  CREATED_WALLET = 'created_wallet',
  UPDATED_WALLET = 'updated_wallet',
  DELETED_WALLET = 'deleted_wallet',
  CREATED_MERCHANT = 'created_merchant',
  UPDATED_MERCHANT = 'updated_merchant',
  DELETED_MERCHANT = 'deleted_merchant',
}

@Entity('users_activities')
export class UserActivity {
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
  @ApiProperty({})
  merchantId: string;

  @Column({ type: 'varchar' })
  @ApiProperty({
    required: false,
  })
  action?: UserActivityAction;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({})
  requestUrl: string;

  @Column({ type: 'varchar', nullable: false })
  @ApiProperty({})
  requestMethod: string;

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
    type: Merchant,
  })
  @Type(() => Merchant)
  @IsOptional()
  @ManyToOne(() => Merchant, (record: Merchant) => record.apiKeys)
  @JoinColumn()
  merchant?: Merchant;
}

@EntityRepository(UserActivity)
export class UserActivityRepository extends Repository<UserActivity> {}

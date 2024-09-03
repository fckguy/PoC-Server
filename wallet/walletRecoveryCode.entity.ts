import { Column, Entity, EntityRepository, Repository, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '@modules/user/user.entity';

@Entity('wallet_recovery_codes')
export class WalletRecoveryCode {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'Recovery Code ID',
  })
  id: string;

  @Column({ type: 'uuid' })
  @ApiProperty({
    description: 'Wallet user ID',
  })
  userId: string;

  @Column({ type: 'uuid' })
  @ApiProperty({
    description: 'Wallet ID',
  })
  walletId: string;

  @Column({ type: 'varchar' })
  @ApiProperty({
    description: 'Recovery code hashed',
  })
  codeHash: string;

  @Column({ type: 'varchar' })
  @ApiProperty({
    description: 'Hashing salt',
  })
  hashingSalt: string;

  @Column({ type: 'varchar' })
  @ApiProperty({
    description: 'User email',
  })
  email: string;

  @Column({ type: 'varchar' })
  @ApiProperty({
    description: 'Client Auth Pub Key',
  })
  clientAuthPubKey;

  @ManyToOne(() => User, (user: User) => user.wallets)
  @JoinColumn()
  user: User;
}

@EntityRepository(WalletRecoveryCode)
export class WalletRecoveryCodeRepository extends Repository<WalletRecoveryCode> {}

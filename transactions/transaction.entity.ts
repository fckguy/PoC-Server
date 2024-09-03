import { AssetConfig } from '@modules/asset/asset-config.entity';
import { ChainSlip44, OwnershipType, TokenStandard } from '@modules/asset/models/asset.models';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  EntityRepository,
  Repository,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { MultisigParticipant } from './multisigParticipant.entity';
import { Merchant } from '@modules/merchant/merchant.entity';
import { Type } from 'class-transformer';

export enum TransactionStatus {
  PENDING_APPROVAL = 'PENDING-APPROVAL',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  SUCCESSFUL = 'SUCCESSFUL',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Unique Reference',
  })
  @Column({ type: 'varchar', nullable: false })
  reference: string;

  @ApiProperty({
    description: 'Transaction hash after broadcasting',
  })
  @Column({ type: 'varchar' })
  hash: string;

  @ApiProperty({
    description: "Wallet user ID of the transaction's initiator",
  })
  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  @ApiProperty({
    description: 'Merchant ID',
  })
  merchantId: string;

  @ApiProperty({
    description: 'User email to be used for notification',
  })
  @Column({ type: 'varchar' })
  userEmail: string;

  @ApiProperty({
    description: 'Chain ID',
  })
  @Column({ type: 'uuid' })
  chainId: string;

  @ApiProperty({
    description: 'Chain Name',
  })
  @Column({ type: 'varchar', nullable: false })
  chainName: string;

  @ApiProperty({
    description: 'Chain Slip 44 Number',
  })
  @Column({ type: 'int4' })
  chainSlip44: ChainSlip44;

  @ApiProperty({
    description: 'Originator Wallaby Wallet ID',
  })
  @Column({ type: 'uuid' })
  fromWalletId: string;

  @ApiProperty({
    description: 'Originator Wallet Address',
  })
  @Column({ type: 'varchar', nullable: false })
  fromAddress: string;

  @ApiProperty({
    description: 'Recipient Wallaby Wallet ID',
  })
  @Column({ type: 'uuid' })
  toWalletId: string;

  @ApiProperty({
    description: 'Recipient Wallet Address',
  })
  @Column({ type: 'varchar', nullable: false })
  toAddress: string;

  @ApiProperty({
    description: 'Wallaby Asset ID',
  })
  @Column({ type: 'uuid' })
  assetId: string;

  @ApiProperty({
    description: 'Asset Symbol',
  })
  @Column({ type: 'varchar', nullable: false })
  assetSymbol: string;

  @ApiProperty({
    description: 'Asset Type that can be ERC_20, BEP_20, ALGO_STANDARDs, or SUI_COIN',
  })
  @Column({ type: 'varchar', nullable: false })
  tokenType: TokenStandard;

  @ApiProperty({
    description: 'Transaction Amount',
  })
  @Column({ type: 'decimal', nullable: false })
  amount: string;

  @ApiProperty({
    description: 'Transaction Processing Fee',
  })
  @Column({ type: 'decimal' })
  fee: string;

  @ApiProperty({
    description: 'Transaction Memo or Note',
  })
  @Column({ type: 'varchar' })
  note: string;

  @ApiProperty({
    description: 'Transaction Nonce',
  })
  @Column({ type: 'decimal' })
  nonce: number;

  @ApiProperty({
    description: 'Transaction Gas Price',
  })
  @Column({ type: 'decimal' })
  gasPrice: number;

  @ApiProperty({
    description: 'The API caller, internal or external for third party uses',
  })
  @Column({ type: 'varchar', nullable: false, default: 'internal' })
  submitter: string;

  @ApiProperty({
    description: 'The API caller, internal or external for third party uses',
  })
  @Column({ type: 'varchar', nullable: false, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @ApiProperty({
    description: 'The field differentiate multisig transaction',
  })
  @Column({ type: 'varchar', default: OwnershipType.SINGLE_OWNER })
  ownershipType: OwnershipType;

  @ApiProperty({
    description: 'Multisig version',
  })
  @Column({ type: 'int2', default: 0 })
  multisigVersion: number;

  @ApiProperty({
    description: 'The number of signer required to broadcast the transaction',
  })
  @Column({ type: 'int2', default: 0 })
  multisigSignerThreshold: number;

  @ApiProperty({
    description: 'The number of signer that have approved the transaction',
  })
  @Column({ type: 'int2', default: 0 })
  multisigSignerApprovedCount: number;

  @ApiProperty({
    description:
      'The transaction signed blob data, useful to keep track of multisig transactions intermediary signed states',
  })
  @Column({ type: 'varchar', nullable: true })
  txBlob: string;

  @ApiProperty({
    description: 'Sui Transaction ID',
  })
  @Column({ type: 'varchar', nullable: true })
  suiTransactionId: string; // New property for Sui transaction ID

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

  @ManyToOne(() => AssetConfig, (assetConfig: AssetConfig) => assetConfig.transactions)
  @JoinColumn()
  asset: AssetConfig;

  @ApiProperty({
    description: 'List of participant of a multisig transaction',
    required: false,
    type: () => MultisigParticipant,
    isArray: true,
  })
  @OneToMany(() => MultisigParticipant, (participant: MultisigParticipant) => participant.transaction)
  multisigParticipants: MultisigParticipant;

  @ApiProperty({
    type: Merchant,
  })
  @Type(() => Merchant)
  @ManyToOne(() => Merchant, (record: Merchant) => record.apiKeys)
  @JoinColumn()
  merchant: Merchant;
}

@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {}

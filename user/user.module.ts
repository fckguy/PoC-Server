import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/user/user.entity';
import { Wallet } from '@modules/wallet/wallet.entity';
import { AuthPublicKey } from '@modules/auth-public-key/auth-public-key.entity';
import { AuthMessage } from '@modules/auth/auth-message.entity';
import { MultisigParticipant } from '@modules/transactions/multisigParticipant.entity';
import { Transaction } from '@modules/transactions/transaction.entity';
import { UserAsset } from './user-asset.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AssetConfig } from '@modules/asset/asset-config.entity';
import { Chain } from '@modules/chain/chain.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Wallet,
      AuthPublicKey,
      AuthMessage,
      UserAsset,
      Transaction,
      MultisigParticipant,
      AssetConfig,
      Chain,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}

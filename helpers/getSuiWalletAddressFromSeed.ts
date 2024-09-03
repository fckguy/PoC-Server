import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import logger from './logger';

export const getSuiWalletFromSeed = async (phrase: string): Promise<{ walletAddress: string | null }> => {
  try {
    const seed = Uint8Array.from(Buffer.from(phrase, 'hex'));
    const keypair = Ed25519Keypair.fromSecretKey(seed);
    const walletAddress = keypair.getPublicKey().toSuiAddress();

    return { walletAddress };
  } catch (error) {
    logger.error(`Failed to get Sui wallet address from seed: ${error?.message} ${error?.stack}`, { error });
    return { walletAddress: null };
  }
};

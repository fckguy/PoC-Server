import { Wallet } from 'ethers';
import logger from './logger';

export const getEVMWalletAddressFromSeed = async (phrase: string): Promise<{ walletAddress: string | null }> => {
  try {
    const wallet = Wallet.fromPhrase(phrase);
    const walletAddress = await wallet.getAddress();

    return { walletAddress };
  } catch (error) {
    logger.error(`Failed to get EVM wallet address from seed: ${error?.message} ${error?.stack}`, { error });
    return { walletAddress: null };
  }
};

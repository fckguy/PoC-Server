import 'dotenv/config';
import {
  AssetConfigInterface,
  AssetType,
  ChainSlip44,
  TokenStandard,
  ChainName,
} from '@modules/asset/models/asset.models';
import { BadRequestException } from '@nestjs/common';
import ERC20TokenList from './erc20.tokenlist.json';
import AlgoStandardTokenList from './algo.tokenlist.json';
import PlygonTokenMainnetList from './polygon.tokenlist.json';
import PlygonTokenTestnetList from './polygon.tokenlist.testnet.json';
import BaseChainTokenList from './baseChain.tokenlist.json';
import BaseChainTokenTestnetList from './baseChain.testnet.tokenlist.json';
import AVAXTokensMainnet from './avalanche.tokenlist.json';
import AVAXTokensTestnet from './avalanche.testnet.tokenlist.json';
import SuiTokenMainnetList from './sui.tokenlist.json';
import SuiTokenTestnetList from './sui.tokenlist.testnet.json';

const PlygonTokenList = process.env.NETWORK === 'testnet' ? PlygonTokenTestnetList : PlygonTokenMainnetList;

const AVAXTokenList = process.env.NETWORK === 'testnet' ? AVAXTokensTestnet : AVAXTokensMainnet;

const BASETokenList = process.env.NETWORK === 'testnet' ? BaseChainTokenTestnetList : BaseChainTokenList;

const SuiTokenList = process.env.NETWORK === 'testnet' ? SuiTokenTestnetList : SuiTokenMainnetList;

export const BTC: AssetConfigInterface = {
  chainId: '0',
  assetType: AssetType.COIN,
  chain: ChainSlip44.BTC,
  decimals: 8,
  derivationPath: "m/84'/0'/0'/0/0",
  iconUrl: '',
  name: 'Bitcoin',
  chainName: ChainName.BITCOIN,
  rpcUrl: '',
  symbol: 'BTC',
  ticker: 'BTC',
};

export const ETH: AssetConfigInterface = {
  chainId: '1',
  assetType: AssetType.COIN,
  chain: ChainSlip44.ETH,
  chainName: ChainName.ETHEREUM,
  decimals: 18,
  derivationPath: "m/44'/60'/0'/0/0",
  iconUrl:
    'https://raw.githubusercontent.com/trustwallet/assets/16416cfe8026abc735c329794edeb21115fd3a7d/blockchains/ethereum/info/logo.png',
  name: 'Ethereum',
  rpcUrl: 'https://goerli.infura.io/v3/abe680de4a264064851c67d0eea24000',
  symbol: 'ETH',
  ticker: 'ETH',
  blockBookUrl: 'https://eth2.trezor.io',
};

export const AVAX: AssetConfigInterface = {
  chainId: '4',
  assetType: AssetType.COIN,
  chain: ChainSlip44.AVAX,
  chainName: ChainName.AVALANCHE,
  decimals: 18,
  derivationPath: "m/44'/60'/0'/0/0",
  iconUrl:
    'https://github.com/trustwallet/assets/blob/125e90522a1eb50d25e1a57dffe49fb59842c412/blockchains/avalanchec/info/logo.png',
  name: 'Avalanche',
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  symbol: 'AVAX',
  ticker: 'AVAX',
  blockBookUrl: ' https://snowtrace.io/',
};

export const MATIC: AssetConfigInterface = {
  chainId: '137',
  assetType: AssetType.COIN,
  chain: ChainSlip44.MATIC,
  chainName: ChainName.POLYGON,
  decimals: 18,
  derivationPath: "m/44'/60'/0'/0/0",
  iconUrl:
    'https://github.com/trustwallet/assets/blob/125e90522a1eb50d25e1a57dffe49fb59842c412/blockchains/avalanchec/info/logo.png',
  name: 'POLYGON',
  rpcUrl: 'https://polygon-rpc.com/',
  symbol: 'MATIC',
  ticker: 'MATIC',
  blockBookUrl: ' https://polygonscan.com/',
};

export const BSC: AssetConfigInterface = {
  chainId: '56',
  assetType: AssetType.COIN,
  chain: ChainSlip44.BSC,
  chainName: ChainName.BSC,
  decimals: 18,
  derivationPath: "m/44'/60'/0'/0/0",
  iconUrl: '',
  name: 'Binance Smart Chain',
  rpcUrl: 'https://bsc-dataseed3.ninicoin.io',
  symbol: 'BNB',
  ticker: 'BNB',
  blockBookUrl: 'https://bscscan.com/',
};

// Algo Testnet https://morning-restless-moon.algorand-testnet.quiknode.pro/87a6165e261e907551e01ec996750283f4daef7e/algod/
// Algo Mainnet https://restless-wandering-sound.algorand-mainnet.quiknode.pro/abfea616bef4ca8c1706abf6f1497ed6d71bd892/algod/
// Algo Mainnet: https://mainnet-algorand.api.purestake.io/ps2

// Indexer Mainnet: https://mainnet-algorand.api.purestake.io/idx2
// Algo Mainnet: https://mainnet-algorand.api.purestake.io/ps2

// Algo Testnet: https://testnet-algorand.api.purestake.io/ps2
// Indexer Testnet: https://testnet-algorand.api.purestake.io/idx2

export const ALGO: AssetConfigInterface = {
  chainId: '1',
  assetType: AssetType.COIN,
  chain: ChainSlip44.ALGO,
  chainName: ChainName.ALGORAND,
  decimals: 6,
  derivationPath: "m/44'/283'/0'/0/0",
  iconUrl:
    'https://raw.githubusercontent.com/trustwallet/assets/16416cfe8026abc735c329794edeb21115fd3a7d/blockchains/algorand/info/logo.png',
  name: 'Algorand',
  rpcUrl: 'https://testnet-algorand.api.purestake.io/ps2',
  symbol: 'ALGO',
  ticker: 'ALGO',
  indexerUrl: 'https://testnet-algorand.api.purestake.io/idx2',
};

export const SUI: AssetConfigInterface = {
  chainId: process.env.SUI_CHAIN_ID || '84',
  assetType: AssetType.COIN,
  chain: ChainSlip44.SUI,
  decimals: 9,
  derivationPath: "m/44'/784'/0'/0'/0'",
  iconUrl: 'https://aqua-random-cat-402.mypinata.cloud/ipfs/QmZHURKupf3UKN4sp9xwziGZdzcqXienkmtM28pTUntJW7',
  name: 'Sui',
  chainName: ChainName.SUI,
  rpcUrl: process.env.SUI_RPC_URL || '',
  symbol: 'SUI',
  ticker: 'SUI',
};

// A map of key (asset symbols) and values(asset configuration)
export const AssetConfigMap: Record<string, AssetConfigInterface> = {
  BTC,
  ETH,
  ALGO,
  AVAX,
  MATIC,
  BSC,
  SUI,
};

// Load all Polygon token list in the config object.
PlygonTokenList.tokens.forEach((token) => {
  const config = {
    ...MATIC,
    contractAddress: token.address,
    symbol: token.symbol,
    decimals: token.decimals,
    name: token.name,
    iconUrl: token.logoURI,
    assetType: AssetType.TOKEN,
    tokenType: TokenStandard[token.type],
    chainId: `${token.chainId}`,
    chainName: ChainName.POLYGON,
    ticker: token.symbol,
  };
  AssetConfigMap[token.symbol + ETH.chain] = config;
});

// Load all ERC20 token list in the config object.
ERC20TokenList.tokens.forEach((token) => {
  const config = {
    ...ETH,
    contractAddress: token.address,
    symbol: token.symbol,
    decimals: token.decimals,
    name: token.name,
    iconUrl: token.logoURI,
    assetType: AssetType.TOKEN,
    tokenType: TokenStandard[token.type],
    chainId: `${token.chainId}`,
    chainName: ChainName.ETHEREUM,
    ticker: token.symbol,
  };
  AssetConfigMap[token.symbol + ETH.chain] = config;
});

// Load all AVAX token list in the config object.
AVAXTokenList.tokens.forEach((token) => {
  const config = {
    ...AVAX,
    contractAddress: token.address,
    symbol: token.symbol,
    decimals: token.decimals,
    name: token.name,
    iconUrl: token.logoURI,
    assetType: AssetType.TOKEN,
    tokenType: TokenStandard[token.type],
    chainId: `${token.chainId}`,
    chainName: ChainName.AVALANCHE,
    ticker: token.symbol,
  };
  AssetConfigMap[token.symbol + AVAX.chain] = config;
});

BASETokenList.tokens.forEach((token) => {
  const config = {
    ...ETH,
    contractAddress: token.address,
    symbol: token.symbol,
    decimals: token.decimals,
    name: token.name,
    iconUrl: token.logoURI,
    assetType: AssetType.TOKEN,
    tokenType: TokenStandard[token.type] || TokenStandard.BRC_20,
    chainId: `${token.chainId}`,
    assetIndex: Number(token.address),
    chainName: ChainName.BASE,
    ticker: token.symbol,
  };
  AssetConfigMap[token.symbol + ETH.chain] = config;
});

AlgoStandardTokenList.tokens.forEach((token) => {
  const config = {
    ...ALGO,
    contractAddress: token.address,
    symbol: token.symbol,
    decimals: token.decimals,
    name: token.name,
    iconUrl: token.logoURI,
    assetType: AssetType.TOKEN,
    tokenType: TokenStandard.ALGO_STANDARD,
    chainId: `${token.chainId}`,
    assetIndex: Number(token.address),
    chainName: ChainName.ALGORAND,
    ticker: token.symbol,
  };
  AssetConfigMap[token.symbol + ALGO.chain] = config;
});

// SUI token configuration
SuiTokenList.tokens.forEach((token) => {
  const config: AssetConfigInterface = {
    ...SUI, // Assuming SUI is a base config
    contractAddress: '0x0000000000000000000000000000000000000000000000000000000000000002',
    symbol: token.symbol,
    decimals: token.decimals,
    name: token.name,
    iconUrl: token.logoURI,
    assetType: AssetType.COIN,
    tokenType: TokenStandard.SUI_COIN,
    chainId: `${token.chainId}`,
    chainName: ChainName.SUI,
    ticker: token.symbol,
  };
  AssetConfigMap[token.symbol + ChainSlip44.SUI] = config;
});

export const TokenStandardChainMap: Record<string, AssetConfigInterface> = {  ERC_20: ETH,

  // Sample contract: https://goerli.etherscan.io/address/0x0d964452231796ff20CFC7a85D3285791C561094#code
  ERC_1404: ETH,

  ALGO_STANDARD: ALGO,
  // Algorand custom app tokens like the Note
  ALGO_APP: ALGO,
};

AlgoStandardTokenList.tokens.forEach((token) => {
  const config = {
    ...ALGO,
    contractAddress: token.address,
    symbol: token.symbol,
    decimals: token.decimals,
    name: token.name,
    iconUrl: token.logoURI,
    assetType: AssetType.TOKEN,
    tokenType: TokenStandard[token.type] || TokenStandard.ALGO_STANDARD,
    chainId: `${token.chainId}`,
    assetIndex: Number(token.address),
    chainName: ChainName.ALGORAND,
    ticker: token.symbol,
  };
  AssetConfigMap[token.symbol + ALGO.chain] = config;
});

export const getAssetConfig = ({ assetSymbol, tokenType }: { assetSymbol?: string; tokenType?: string }) => {
  // DOCUMENTATION
  // Asset config is dependant on 2 values, asset and its asset type.

  if (!assetSymbol && tokenType && TokenStandardChainMap[tokenType]) {
    return TokenStandardChainMap[tokenType];
  }

  if (tokenType && TokenStandardChainMap[tokenType]?.symbol === assetSymbol) {
    return TokenStandardChainMap[tokenType];
  }

  const assetConfig = tokenType
    ? AssetConfigMap[assetSymbol + TokenStandardChainMap[tokenType]?.chain]
    : AssetConfigMap[assetSymbol];

  if (!assetConfig) {
    throw new BadRequestException({
      message: `Wrong parameters not supported. assetSymbol:${assetSymbol} tokenType: ${tokenType}`,
    });
  }
  return assetConfig;
};

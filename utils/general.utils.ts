import 'dotenv/config';
import * as bitcoin from 'bitcoinjs-lib';
import BigNumber from 'bignumber.js';

export const IsMainnet = process.env.NETWORK === 'mainnet';
export const TestnetDerivationPath = "m/84'/1'/0'/0/0";
export const SegwitDerivationPath = "m/84'/0'/0'/0/0";

export const CurrentNetwork = IsMainnet ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
const units = BigNumber(10).pow(8);
export const toBTC = (num: number | string) => new BigNumber(num).div(units).toFixed();

import { isValidAddress } from 'ethereumjs-util';
import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator';
import algosdk from 'algosdk';
import * as bitcoin from 'bitcoinjs-lib';
import { isValidSuiAddress } from '@mysten/sui/utils';

export const isEvmAddress = (address: string): boolean => {
  return isValidAddress(address);
};

export const isBtcAddress = (address: string): boolean => {
  try {
    bitcoin.address.toOutputScript(address);
    return true;
  } catch (error) {
    return false;
  }
};

export const isAlgoAddress = (address: string): boolean => {
  return algosdk.isValidAddress(address);
};

export const isSuiAddress = (address: string): boolean => {
  return isValidSuiAddress(address);
};

export const isSupportedWalletAddress = (address: string): boolean => {
  return !isEvmAddress(address) && !isBtcAddress(address) && !isAlgoAddress(address) && !isSuiAddress(address);
};

export function IsWalletAddressDecorator(validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'IsWalletAddress',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return !isSupportedWalletAddress(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} address is not supported. Supported addresses are Ethereum, Bitcoin, Algorand, and Sui.`;
        },
      },
    });
  };
}

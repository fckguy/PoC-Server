import { lib } from 'crypto-js';
import * as argon2 from 'argon2';

export interface HashResult {
  data: string;
  salt: string;
}
export interface InitialVector {
  words: number[];
  sigBytes: number;
}

export interface ComputeHashParams {
  data: string;
  salt: string;
}

class Cryptographer {
  // memoryCost: 2 ** 16 KB (64 MB)
  private readonly memoryCost = 2 ** 16;

  private readonly hashLength = 64;

  private readonly parallelismCost = 64;

  private readonly saltLen = 64;

  public generateSalt(): string {
    return lib.WordArray.random(this.saltLen).toString();
  }

  public async computeHash({ data, salt }: ComputeHashParams): Promise<HashResult> {
    const normalizedData: string = data.normalize();
    const dataBuffer: Buffer = Buffer.from(normalizedData, 'utf-8');

    const normalizedSalt: string = data.normalize();
    const saltBuffer: Buffer = Buffer.from(normalizedSalt, 'utf-8');

    const hashedData = await argon2.hash(dataBuffer, {
      type: argon2.argon2id,
      salt: saltBuffer,
    });
    return { data: hashedData, salt };
  }

  public async verifyHashMatch(hashedData: string, rawData: string) {
    return await argon2.verify(hashedData, rawData);
  }
}

export const cryptographer = new Cryptographer();

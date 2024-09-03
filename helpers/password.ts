import { cryptographer } from './cryptographer';

export const generatePasswordHash = async (
  password: string,
): Promise<{
  passwordHash: string;
  passwordSalt: string;
}> => {
  const passwordSalt = cryptographer.generateSalt();

  const { data: passwordHash } = await cryptographer.computeHash({ data: password, salt: passwordSalt });

  return {
    passwordHash,
    passwordSalt,
  };
};

export const comparePassword = async ({
  passwordPlain,
  passwordHash,
  passwordSalt,
}: {
  passwordPlain: string;
  passwordHash: string;
  passwordSalt: string;
}): Promise<boolean> => {
  const hash = await cryptographer.computeHash({ data: passwordPlain, salt: passwordSalt });

  return hash.data === passwordHash;
};

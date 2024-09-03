import { v4 } from 'uuid';

export const generateRandomBytes = (): string => {
  const message = v4().replace(/-/g, '');

  return message;
};

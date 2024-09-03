import { v4 } from 'uuid';

export const generateInviteToken = (): string => v4().replace(/-/g, '');

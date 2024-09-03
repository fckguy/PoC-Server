import { ApiKey } from '@modules/api-key/api-key.entity';
import { User } from '@modules/user/user.entity';
import { Request } from 'express';

export interface CustomRequest extends Request {
  apiKey: ApiKey;
  user?: User | null;
}

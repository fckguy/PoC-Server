import { UserActivityAction } from '@modules/user-activity/user-activity.entity';

export const userActivityActions = [
  {
    api: '/api/v1/auth/sign-in',
    method: 'POST',
    action: UserActivityAction.LOGGED_IN,
  },
  {
    api: '/api/v1/merchants',
    method: 'POST',
    action: UserActivityAction.CREATED_MERCHANT,
  },
];

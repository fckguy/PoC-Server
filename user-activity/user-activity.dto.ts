import { PaginationQueryDto, PaginationResponseDto } from '@modules/user/pagination.dto';
import { UserActivity } from './user-activity.entity';

export class GetActivitiesQueryDto extends PaginationQueryDto {}

export class GetActivitiesResponseDto extends PaginationResponseDto {
  activities: UserActivity[];
}

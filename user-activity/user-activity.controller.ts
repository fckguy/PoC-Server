import { UserRoleGuard } from '@guards/userRole.guard';
import { UserRole } from '@modules/user/user.entity';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserActivityService } from './user-activity.service';
import { GetActivitiesQueryDto, GetActivitiesResponseDto } from './user-activity.dto';

@Controller('users-activities')
export class UserActivityController {
  constructor(private readonly userActivityService: UserActivityService) {}
  @ApiOperation({
    summary: 'Get all activities. This endpoint is only available for super admin and republic admin',
  })
  @ApiResponse({
    type: GetActivitiesResponseDto,
  })
  @UserRoleGuard(UserRole.REPUBLIC_ADMIN, UserRole.SUPER_ADMIN, UserRole.MERCHANT_ADMIN)
  @Get('/')
  getActivitiees(@Query() query: GetActivitiesQueryDto): Promise<GetActivitiesResponseDto> {
    return this.userActivityService.getActivities(query);
  }
}

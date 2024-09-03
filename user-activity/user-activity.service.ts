import { Inject, Injectable, Scope } from '@nestjs/common';
import { GetActivitiesQueryDto, GetActivitiesResponseDto } from './user-activity.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserActivity, UserActivityRepository } from './user-activity.entity';
import { paginateRecord } from '@helpers/paginateRecord';
import { isUUID } from 'class-validator';
import { REQUEST } from '@nestjs/core';
import { CustomRequest } from '@root/types/CustomRequest';
import { UserRole } from '@modules/user/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserActivityService {
  constructor(
    @Inject(REQUEST) private request: CustomRequest,
    @InjectRepository(UserActivity) private readonly userActivityRepository: UserActivityRepository,
  ) {}
  async getActivities({ search, ...query }: GetActivitiesQueryDto): Promise<GetActivitiesResponseDto> {
    const { user } = this.request;

    const andWhere = {};

    if (user.role === UserRole.MERCHANT_ADMIN) {
      andWhere['merchantId'] = user.merchantId;
    }

    const where = [];
    if (search) {
      if (isUUID(search)) {
        where.push(
          {
            id: search,
            ...andWhere,
          },
          {
            externalUserId: search,
            ...andWhere,
          },
        );
      } else {
        where.push({
          action: search,
          ...andWhere,
        });
      }
    }

    const { records, pagination } = await paginateRecord({
      ...query,
      order: {
        createdAt: 'DESC',
      },
      repository: this.userActivityRepository,
      relations: ['user', 'merchant'],
      select: {
        user: {
          id: true,
          externalUserId: true,
          email: true,
        },
        merchant: {
          id: true,
          name: true,
        },
      },
    });

    return {
      activities: records,
      pagination,
    };
  }
}

import { PaginationResponseDto } from '@modules/user/pagination.dto';
import { Between, MoreThanOrEqual, Raw } from 'typeorm';

class PaginationData extends PaginationResponseDto {
  records: any[];
}

export const paginateRecord = async ({
  repository,
  page,
  limit,
  order,
  relations,
  where = {},
  select,
  fromDate,
  toDate,
  search,
}: {
  repository: any;
  page: number;
  limit: number;
  where?: any;
  order?: any;
  relations?: any;
  select?: any;
  fromDate?: string;
  toDate?: string;
  search?: string;
}): Promise<PaginationData> => {
  const skip = (page - 1) * limit;
  const take = limit;

  if (search) {
    where.search = Raw((alias) => `${alias} @@ plainto_tsquery('${search}')`);
  }

  if (fromDate) {
    where = {
      ...where,
      createdAt: MoreThanOrEqual(fromDate),
    };
  }

  if (toDate) {
    where = {
      ...where,
      createdAt: MoreThanOrEqual(toDate),
    };
  }

  if (fromDate && toDate) {
    where = {
      ...where,
      createdAt: Between(fromDate, toDate),
    };
  }

  const [records, totalRecords] = await repository.findAndCount({
    select,
    where,
    order,
    relations,
    skip,
    take,
  });

  const totalPages = Math.ceil(totalRecords / limit);
  return {
    records,
    pagination: {
      totalRecords,
      currentPage: page,
      totalPages,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      pageSize: limit,
    },
  };
};

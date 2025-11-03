/**
 * Pagination utility functions
 * Helps with paginated queries
 */

export const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 15));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginationResponse = (data, pagination, total) => {
  return {
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
      hasNext: pagination.page < Math.ceil(total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
  };
};

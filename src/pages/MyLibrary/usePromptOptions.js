
import { usePromptListQuery } from '@/api/prompts';
import { PAGE_SIZE, SortFields, SortOrderOptions } from '@/common/constants';
import { useProjectId } from '@/pages/hooks';
import { useCallback, useEffect, useState } from 'react';
import { getQueryStatuses } from './useLoadPrompts';

export const usePromptOptions = (query) => {
  const [page, setPage] = useState(0);
  const pageSize = PAGE_SIZE;
  const projectId = useProjectId();

  useEffect(() => {
    setPage(0);
  }, [query]);

  const {
    data,
    error,
    isError,
    isLoading,
    isFetching,
  } = usePromptListQuery({
    projectId,
    page: page,
    pageSize,
    params: {
      tags: [],
      statuses: getQueryStatuses([]),
      sort_by: SortFields.CreatedAt,
      sort_order: SortOrderOptions.DESC,
      query,
    }
  }, { skip: !projectId });

  const onLoadMore = useCallback(() => {
    const existsMore = data?.rows?.length < data?.total;
    if (!existsMore || isFetching) return;
    setPage(page + 1);
  }, [data?.rows?.length, data?.total, isFetching, page]);

  return {
    onLoadMore,
    data,
    error,
    isError,
    isLoading,
    isFetching,
  };
}

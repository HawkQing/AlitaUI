
import { PAGE_SIZE, SortFields, SortOrderOptions } from '@/common/constants';
import { useProjectId, useSelectedProjectId } from '@/pages/hooks';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { getQueryStatuses } from './useLoadPrompts';
import { useApplicationListQuery } from '@/api/applications';

export const useApplicationOptions = ({query, shouldUseSelectedProject}) => {
  const [page, setPage] = useState(0);
  const pageSize = PAGE_SIZE;
  const projectId = useProjectId();
  const selectedProjectId = useSelectedProjectId();
  const realProjectId = useMemo(() => shouldUseSelectedProject ? selectedProjectId : projectId, [projectId, selectedProjectId, shouldUseSelectedProject])

  useEffect(() => {
    setPage(0);
  }, [query]);

  const {
    data,
    error,
    isError,
    isLoading,
    isFetching,
  } = useApplicationListQuery({
    projectId: realProjectId,
    page,
    pageSize,
    params: {
      tags: [],
      statuses: getQueryStatuses([]),
      sort_by: SortFields.CreatedAt,
      sort_order: SortOrderOptions.DESC,
      query,
    }
  }, { skip: !realProjectId });

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

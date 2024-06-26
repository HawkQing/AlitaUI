
import { useDatasourceListQuery } from '@/api/datasources';
import { PAGE_SIZE, SortFields, SortOrderOptions } from '@/common/constants';
import { useProjectId, useSelectedProjectId } from '@/pages/hooks';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { getQueryStatuses } from './useLoadPrompts';

export const useDatasourcesOptions = ({query, shouldUseSelectedProject}) => {
  const [datasourcePage, setDatasourcePage] = useState(0);
  const pageSize = PAGE_SIZE;
  const projectId = useProjectId();
  const selectedProjectId = useSelectedProjectId();
  const realProjectId = useMemo(() => shouldUseSelectedProject ? selectedProjectId : projectId, [projectId, selectedProjectId, shouldUseSelectedProject])

  useEffect(() => {
    setDatasourcePage(0);
  }, [query]);

  const {
    data,
    error,
    isError,
    isLoading,
    isFetching,
  } = useDatasourceListQuery({
    projectId: realProjectId,
    page: datasourcePage,
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
    setDatasourcePage(datasourcePage + 1);
  }, [data?.rows?.length, data?.total, isFetching, datasourcePage]);

  return {
    onLoadMore,
    data,
    error,
    isError,
    isLoading,
    isFetching,
  };
}

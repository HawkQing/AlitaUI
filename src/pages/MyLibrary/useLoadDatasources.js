
import { useDatasourceListQuery, usePublicDataSourcesListQuery } from '@/api/datasources';
import { ViewMode } from '@/common/constants';
import { useAuthorIdFromUrl, usePageQuery, useProjectId } from '@/pages/hooks';
import { useCallback } from 'react';
import { getQueryStatuses } from './useLoadPrompts';

export const useLoadDatasources = (viewMode, sortBy, sortOrder, statuses, forceSkip=false) => {
  const { page, setPage, query, pageSize, tagList, selectedTagIds } = usePageQuery();
  const authorId = useAuthorIdFromUrl();
  const projectId = useProjectId();  
  const { 
    data: publicDatasourceData,
    error: publicDatasourceError,
    isError: isPublicDatasourceError,
    isLoading: isPublicDatasourceLoading,
    isFetching: isPublicDatasourceFetching,
  } = usePublicDataSourcesListQuery({
    page,
    pageSize,
    params: {
      tags: selectedTagIds,
      author_id: viewMode === ViewMode.Public ? authorId : undefined,
      statuses: getQueryStatuses(statuses),
      sort_by: sortBy,
      sort_order: sortOrder,
      query,
    }
  }, {skip: viewMode !== ViewMode.Public || forceSkip});

  const { 
    data: privateDatasourceData,
    error: privateDatasourceError,
    isError: isPrivateDatasourceError,
    isLoading: isPrivateDatasourceLoading,
    isFetching: isPrivateDatasourceFetching,
  } = useDatasourceListQuery({
    projectId,
    page,
    pageSize,
    params: {
      tags: selectedTagIds,
      author_id: viewMode === ViewMode.Public ? authorId : undefined,
      statuses: getQueryStatuses(statuses),
      sort_by: sortBy,
      sort_order: sortOrder,
      query,
    }
  }, {skip: viewMode !== ViewMode.Owner || !projectId || forceSkip});

  const onLoadMoreDatasources = useCallback(() => {
    if (!isPublicDatasourceFetching && !isPrivateDatasourceFetching) {
      setPage(page + 1);
    }
  }, [isPublicDatasourceFetching, isPrivateDatasourceFetching, setPage, page]);

  return {
    onLoadMoreDatasources,
    tagList, 
    selectedTagIds,
    data: viewMode === ViewMode.Owner ? privateDatasourceData : publicDatasourceData,
    isDatasourcesError: viewMode === ViewMode.Owner ? isPrivateDatasourceError : isPublicDatasourceError,
    isDatasourcesFetching: viewMode === ViewMode.Owner ? (!!page && isPrivateDatasourceFetching) : (!!page && isPublicDatasourceFetching),
    isDatasourcesLoading: viewMode === ViewMode.Owner ? isPrivateDatasourceLoading : isPublicDatasourceLoading,
    isMoreDatasourcesError: viewMode === ViewMode.Owner ? (!!page && isPrivateDatasourceError) : (!!page && isPublicDatasourceError),
    isDatasourcesFirstFetching: viewMode === ViewMode.Owner ? (!page && isPrivateDatasourceFetching) : (!page && isPublicDatasourceFetching),
    datasourcesError: viewMode === ViewMode.Owner ? privateDatasourceError : publicDatasourceError,
  };
}


import { ViewMode } from '@/common/constants';
import { useAuthorIdFromUrl, usePageQuery, useProjectId } from '@/pages/hooks';
import { useCallback } from 'react';
import { getQueryStatuses } from './useLoadPrompts';
import { useApplicationListQuery, usePublicApplicationsListQuery } from '@/api/applications';

export const useLoadApplications = (viewMode, sortBy, sortOrder, statuses, forceSkip=false) => {
  const { query, page, pageSize, setPage, tagList, selectedTagIds } = usePageQuery();
  const authorId = useAuthorIdFromUrl();
  const projectId = useProjectId();  
  const { 
    data: publicApplicationData,
    error: publicApplicationError,
    isError: isPublicApplicationError,
    isLoading: isPublicApplicationLoading,
    isFetching: isPublicApplicationFetching,
  } = usePublicApplicationsListQuery({
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
    data: privateApplicationData,
    error: privateApplicationError,
    isError: isPrivateApplicationError,
    isLoading: isPrivateApplicationLoading,
    isFetching: isPrivateApplicationFetching,
  } = useApplicationListQuery({
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

  const onLoadMoreApplications = useCallback(() => {
    if (!isPublicApplicationFetching && !isPrivateApplicationFetching) {
      setPage(page + 1);
    }
  }, [isPublicApplicationFetching, isPrivateApplicationFetching, setPage, page]);

  return {
    tagList, 
    onLoadMoreApplications,
    data: viewMode === ViewMode.Owner ? privateApplicationData : publicApplicationData,
    isApplicationsError: viewMode === ViewMode.Owner ? isPrivateApplicationError : isPublicApplicationError,
    isApplicationsFetching: viewMode === ViewMode.Owner ? (!!page && isPrivateApplicationFetching) : (!!page && isPublicApplicationFetching),
    isApplicationsLoading: viewMode === ViewMode.Owner ? isPrivateApplicationLoading : isPublicApplicationLoading,
    isMoreApplicationsError: viewMode === ViewMode.Owner ? (!!page && isPrivateApplicationError) : (!!page && isPublicApplicationError),
    isApplicationsFirstFetching: viewMode === ViewMode.Owner ? (!page && isPrivateApplicationFetching) : (!page && isPublicApplicationFetching),
    applicationsError: viewMode === ViewMode.Owner ? privateApplicationError : publicApplicationError,
  };
}

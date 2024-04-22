import { useCollectionListQuery } from '@/api/collections';
import { ContentType, ViewMode } from '@/common/constants';
import { buildErrorMessage, sortByCreatedAt } from '@/common/utils';
import CardList from '@/components/CardList';
import Toast from '@/components/Toast.jsx';
import useCardList from '@/components/useCardList';
import { useAuthorIdFromUrl, usePageQuery, useProjectId, useViewMode } from '@/pages/hooks';
import * as React from 'react';
import { useSelector } from 'react-redux';
import RightPanel from './RightPanel';
import { getQueryStatuses, useLoadPrompts } from './useLoadPrompts';
import { useLoadDatasources } from './useLoadDatasources';
import { useLoadApplications } from './useLoadApplications';

const EmptyListPlaceHolder = ({ query, viewMode, name }) => {
  if (!query) {
    if (viewMode !== ViewMode.Owner) {
      return <div>{`${name} has not created anything yet.`}</div>
    } else {
      return <div>You have not created anything yet. <br />Create yours now!</div>
    }
  } else {
    return <div>Nothing found. <br />Create yours now!</div>;
  }
};

const AllStuffList = ({
  rightPanelOffset,
  sortBy,
  sortOrder,
  statuses,
  displayedTabs,
}) => {
  const { query, page, setPage, pageSize, tagList, selectedTagIds } = usePageQuery();
  const viewMode = useViewMode();
  const {
    renderCard,
  } = useCardList(viewMode);

  const {
    loadMore,
    data,
    isPromptError,
    isMorePromptError,
    isPromptFirstFetching,
    isPromptFetching,
    isPromptLoading,
    promptError,
  } = useLoadPrompts(viewMode, sortBy, sortOrder, statuses, !displayedTabs.prompts);

  const { total = 0 } = data || {};
  const authorId = useAuthorIdFromUrl();
  const { filteredList } = useSelector((state) => state.prompts);
  const { name } = useSelector((state) => state.trendingAuthor.authorDetails);
  const loadMorePrompts = React.useCallback(() => {
    const existsMore = total && filteredList.length < total;
    if (!existsMore) return;
    loadMore();
  }, [filteredList.length, loadMore, total]);

  const projectId = useProjectId();
  const { error: collectionError,
    data: collectionsData,
    isError: isCollectionsError,
    isLoading: isCollectionsLoading,
    isFetching: isCollectionFetching,
  } = useCollectionListQuery({
    projectId: projectId,
    page,
    pageSize,
    params: {
      query,
      tags: selectedTagIds,
      author_id: viewMode === ViewMode.Public ? authorId : undefined,
      statuses: getQueryStatuses(statuses),
    }
  }, {
    skip: !projectId || !displayedTabs.collections
  });
  const { rows: collections = [], total: collectionTotal = 0 } = collectionsData || {};

  const loadMoreCollections = React.useCallback(() => {
    if (collectionTotal <= collections.length) {
      return;
    } 
    setPage(page + 1);
  }, [collectionTotal, collections.length, page, setPage]);

  const {
    onLoadMoreDatasources,
    data: datasourcesData,
    isDatasourcesError,
    isDatasourcesFetching,
    isDatasourcesLoading,
    datasourcesError,
  } =  useLoadDatasources(viewMode, sortBy, sortOrder, statuses, !displayedTabs.datasources) 
  const { rows: datasources = [], total: datasourcesTotal = 0 } = datasourcesData || {};

  const loadMoreDatasources = React.useCallback(() => {
    if (datasourcesTotal <= datasources.length) {
      return;
    } 
    onLoadMoreDatasources();
  }, [datasourcesTotal, datasources.length, onLoadMoreDatasources]);
  
  const {
    onLoadMoreApplications,
    data: applicationData,
    isApplicationsError,
    isApplicationsFetching,
    isApplicationsLoading,
    applicationsError,
  } = useLoadApplications(viewMode, sortBy, sortOrder, statuses, !displayedTabs.applications)
  const { rows: applications = [], total: applicationsTotal = 0 } = applicationData || {};

  const loadMoreApplications = React.useCallback(() => {
    if (applicationsTotal <= applications.length) {
      return;
    } 
    onLoadMoreApplications();
  }, [applicationsTotal, applications.length, onLoadMoreApplications]);

  const onLoadMore = React.useCallback(
    () => {
      if (!isPromptFetching && !isCollectionFetching && !isDatasourcesFetching || !isApplicationsFetching) {
        loadMorePrompts();
        loadMoreCollections();
        loadMoreDatasources();
        loadMoreApplications();
      }
    },
    [isCollectionFetching, isDatasourcesFetching, isPromptFetching, isApplicationsFetching, loadMoreCollections, loadMoreDatasources, loadMorePrompts, loadMoreApplications],
  );

  const realDataList = React.useMemo(() => {
    const prompts = filteredList.map((prompt) => ({
      ...prompt,
      cardType: viewMode === ViewMode.Owner ? ContentType.MyLibraryPrompts : ContentType.UserPublicPrompts,
    }));
    const collectionList = collections.map((collection) => ({
      ...collection,
      cardType: viewMode === ViewMode.Owner ? ContentType.MyLibraryCollections : ContentType.UserPublicCollections,
    }));
    const datasourceList = datasources.map((datasource) => ({
      ...datasource,
      cardType: viewMode === ViewMode.Owner ? ContentType.MyLibraryDatasources : ContentType.UserPublicDatasources,
    }));
    const applicationList = applications.map((application) => ({
      ...application,
      cardType: viewMode === ViewMode.Owner ? ContentType.MyLibraryApplications : ContentType.UserPublicApplications,
    }));
    const finalList = [...prompts, ...collectionList, ...datasourceList, ...applicationList].sort(sortByCreatedAt);
    return finalList;
  }, [applications, collections, datasources, filteredList, viewMode]);

  return (
    <>
      <CardList
        mixedContent
        key={'AllStuffList'}
        cardList={realDataList}
        total={total + collectionTotal + datasourcesTotal}
        isLoading={isPromptLoading || isPromptFirstFetching || isCollectionsLoading || isDatasourcesLoading || isApplicationsLoading}
        isError={isPromptError || isCollectionsError}
        rightPanelOffset={rightPanelOffset}
        rightPanelContent={<RightPanel tagList={tagList} />}
        renderCard={renderCard}
        isLoadingMore={isPromptFetching}
        loadMoreFunc={onLoadMore}
        cardType={viewMode === ViewMode.Owner ? ContentType.MyLibraryPrompts : ContentType.UserPublicPrompts}
        emptyListPlaceHolder={<EmptyListPlaceHolder query={query} viewMode={viewMode} name={name} />}
      />
      <Toast
        open={isMorePromptError || isPromptError || isCollectionsError || isDatasourcesError || isApplicationsError}
        severity={'error'}
        message={buildErrorMessage(promptError || collectionError || datasourcesError || applicationsError)}
      />
    </>
  );
};

export default AllStuffList;

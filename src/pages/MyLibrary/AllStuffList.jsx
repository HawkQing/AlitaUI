import { ContentType, ViewMode } from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import CardList from '@/components/CardList';
import Categories from '@/components/Categories';
import Toast from '@/components/Toast.jsx';
import useCardList from '@/components/useCardList';
import useTags from '@/components/useTags';
import { useViewModeFromUrl, useCollectionProjectId, useAuthorIdFromUrl } from '@/pages/hooks';
import * as React from 'react';
import { useSelector } from 'react-redux';
import { useLoadPrompts } from './useLoadPrompts';
import AuthorInformation from '@/components/AuthorInformation';
import { useCollectionListQuery } from '@/api/collections';
import useQueryTrendingAuthor from './useQueryTrendingAuthor';

const itemSortFunc = (a, b) => {
  if (a.created_at < b.created_at) {
    return 1;
  } else if (a.created_at > b.created_at) {
    return -1;
  } else {
    return 0;
  }
}

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
}) => {
  const { query } = useSelector(state => state.search);
  const viewMode = useViewModeFromUrl();
  const {
    renderCard,
  } = useCardList(viewMode);

  const { tagList } = useSelector((state) => state.prompts);
  const { selectedTagIds, calculateTagsWidthOnCard, setGetElement } = useTags(tagList);

  const {
    loadMore,
    data,
    isPromptError,
    isMorePromptError,
    isPromptFirstFetching,
    isPromptFetching,
    isPromptLoading,
    promptError,
  } = useLoadPrompts(viewMode, selectedTagIds, sortBy, sortOrder, statuses);

  const { total } = data || {};
  const authorId = useAuthorIdFromUrl();
  const { isLoadingAuthor } = useQueryTrendingAuthor();
  const { filteredList } = useSelector((state) => state.prompts);
  const { name } = useSelector((state) => state.trendingAuthor.authorDetails);
  const loadMorePrompts = React.useCallback(() => {
    const existsMore = total && filteredList.length < total;
    if (!existsMore) return;
    loadMore();
  }, [filteredList.length, loadMore, total]);

  const collectionProjectId = useCollectionProjectId();
  const [page, setPage] = React.useState(0);
  const { error: collectionError,
    data: collectionsData,
    isError: isCollectionsError,
    isLoading: isCollectionsLoading,
    isFetching: isCollectionFetching,
  } = useCollectionListQuery({
    projectId: collectionProjectId,
    page,
    params: {
      query,
      author_id: viewMode === ViewMode.Public ? authorId : undefined,
    }
  }, {
    skip: !collectionProjectId
  });
  const { rows: collections = [] } = collectionsData || {};

  const loadMoreCollections = React.useCallback(() => {
    if (collectionsData?.total <= collections.length) {
      return;
    } setPage(page + 1);
  }, [collections.length, collectionsData?.total, page]);

  const onLoadMore = React.useCallback(
    () => {
      if (!isPromptFetching && !isCollectionFetching) {
        loadMorePrompts();
        loadMoreCollections();
      }
    },
    [isCollectionFetching, isPromptFetching, loadMoreCollections, loadMorePrompts],
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
    const finalList = [...prompts, ...collectionList].sort(itemSortFunc);
    return finalList;
  }, [collections, filteredList, viewMode]);

  React.useEffect(() => {
    if (isPromptFirstFetching || isPromptFetching || isCollectionsLoading) return
    calculateTagsWidthOnCard();
    setGetElement(false);
  }, [calculateTagsWidthOnCard, setGetElement, isPromptFirstFetching, isPromptFetching, isCollectionsLoading]);

  return (
    <>
      <CardList
        key={'AllStuffList'}
        cardList={realDataList}
        isLoading={isPromptLoading || isPromptFirstFetching || isCollectionsLoading}
        isError={isPromptError || isCollectionsError}
        rightPanelOffset={rightPanelOffset}
        rightPanelContent={
          <>
            <Categories tagList={tagList} title='Tags' style={{ height: '232px' }} />
            <AuthorInformation isLoading={isLoadingAuthor} />
          </>
        }
        renderCard={renderCard}
        isLoadingMore={isPromptFetching}
        loadMoreFunc={onLoadMore}
        cardType={viewMode === ViewMode.Owner ? ContentType.MyLibraryPrompts : ContentType.UserPublicPrompts}
        emptyListPlaceHolder={<EmptyListPlaceHolder query={query} viewMode={viewMode} name={name} />}
      />
      <Toast
        open={isMorePromptError || isPromptError || isCollectionsError}
        severity={'error'}
        message={buildErrorMessage(promptError || collectionError)}
      />
    </>
  );
};

export default AllStuffList;

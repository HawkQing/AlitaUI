import { useCollectionListQuery } from '@/api/collections';
import { CollectionStatus, ContentType, PUBLIC_PROJECT_ID, ViewMode } from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import CardList from '@/components/CardList';
import Categories from '@/components/Categories';
import Toast from '@/components/Toast.jsx';
import useCardList from '@/components/useCardList';
import * as React from 'react';
import TrendingAuthors from '@/components/TrendingAuthors';
import { usePageQuery, useSortQueryParamsFromUrl } from '@/pages/hooks';
import { rightPanelStyle, tagsStyle } from '@/pages/MyLibrary/CommonStyles';
import useDispatchQueryParams from './useDispatchQueryParams';

const emptyListPlaceHolder = <div>No public collections yet. <br />Publish yours now!</div>;
const emptySearchedListPlaceHolder = <div>No collections found. <br />Create yours now!</div>;

export default function Latest() {
  const {
    renderCard,
  } = useCardList(ViewMode.Public);
  const { query, page, setPage, tagList, selectedTagIds } = usePageQuery();

  const { sort_by, sort_order } = useSortQueryParamsFromUrl({ defaultSortOrder: 'desc', defaultSortBy: 'created_at' })
  const { error,
    data,
    isError,
    isFetching,
  } = useCollectionListQuery({
    projectId: PUBLIC_PROJECT_ID,
    page,
    params: {
      statuses: CollectionStatus.Published,
      tags: selectedTagIds,
      sort_by,
      sort_order,
      query,
    }
  });
  const { rows: collections = [], total } = data || {};

  const loadMoreCollections = React.useCallback(() => {
    if (total <= collections.length) {
      return;
    }
    setPage(page + 1);
  }, [collections.length, total, page, setPage]);

  useDispatchQueryParams(page, selectedTagIds, query);

  return (
    <>
      <CardList
        cardList={collections}
        total={total}
        isLoading={isFetching}
        isError={isError}
        rightPanelOffset={'82px'}
        rightPanelContent={
          <div style={rightPanelStyle}>
            <Categories tagList={tagList} style={tagsStyle} />
            <TrendingAuthors />
          </div>
        }
        renderCard={renderCard}
        isLoadingMore={!!page && isFetching}
        loadMoreFunc={loadMoreCollections}
        cardType={ContentType.CollectionsLatest}
        emptyListPlaceHolder={query ? emptySearchedListPlaceHolder : emptyListPlaceHolder}
      />
      <Toast
        open={isError}
        severity={'error'}
        message={buildErrorMessage(error)}
      />
    </>
  );
}
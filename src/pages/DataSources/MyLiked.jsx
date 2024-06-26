import { CollectionStatus, ContentType, ViewMode } from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import CardList from '@/components/CardList';
import Categories from '@/components/Categories';
import Toast from '@/components/Toast.jsx';
import useCardList from '@/components/useCardList';
import { rightPanelStyle, tagsStyle } from '@/pages/MyLibrary/CommonStyles';
import TrendingAuthors from '@/components/TrendingAuthors';
import { usePageQuery, useSortQueryParamsFromUrl } from '@/pages/hooks';
import * as React from 'react';
import useDatasourceDispatchQueryParams from './useDatasourceDispatchQueryParams';
import { usePublicDataSourcesListQuery } from '@/api/datasources';

const emptyListPlaceHolder = <div>You have not liked any data sources yet. <br />Choose the data sources you like now!</div>;
const emptySearchedListPlaceHolder = <div>No data sources found yet. <br />Publish yours now!</div>;

export default function MyLiked() {
  const {
    renderCard,
  } = useCardList(ViewMode.Public);
  const { query, page, setPage, tagList, selectedTagIds } = usePageQuery();
  const { sort_by, sort_order } = useSortQueryParamsFromUrl({ defaultSortOrder: 'desc', defaultSortBy: 'created_at' })
  const { error,
    data,
    isError,
    isFetching,
  } = usePublicDataSourcesListQuery({
    page,
    params: {
      statuses: CollectionStatus.Published,
      tags: selectedTagIds,
      sort_by,
      sort_order,
      query,
      my_liked: true
    }
  });
  const { rows: collections = [], total } = data || {};

  const loadMoreCollections = React.useCallback(() => {
    if (total <= collections.length) {
      return;
    }
    setPage(page + 1);
  }, [collections.length, total, page, setPage]);

  useDatasourceDispatchQueryParams(page, selectedTagIds, query);
  
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
            <Categories tagList={tagList} style={tagsStyle} my_liked />
            <TrendingAuthors />
          </div>
        }
        renderCard={renderCard}
        isLoadingMore={!!page && isFetching}
        loadMoreFunc={loadMoreCollections}
        cardType={ContentType.DatasourcesMyLiked}
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
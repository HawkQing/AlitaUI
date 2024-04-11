import { CollectionStatus, ContentType, ViewMode } from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import CardList from '@/components/CardList';
import Categories from '@/components/Categories';
import Toast from '@/components/Toast.jsx';
import useCardList from '@/components/useCardList';
import * as React from 'react';
import TrendingAuthors from '@/components/TrendingAuthors';
import { usePageQuery, useSortQueryParamsFromUrl } from '@/pages/hooks';
import { rightPanelStyle, tagsStyle } from '@/pages/MyLibrary/CommonStyles';
import useApplicationDispatchQueryParams from './useApplicationsDispatchQueryParams';
import { usePublicApplicationsListQuery } from '@/api/applications';

const emptyListPlaceHolder = <div>No public applications yet. <br />Publish yours now!</div>;
const emptySearchedListPlaceHolder = <div>No applications found. <br />Create yours now!</div>;

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
  } = usePublicApplicationsListQuery({
    page,
    params: {
      statuses: CollectionStatus.Published,
      tags: selectedTagIds,
      sort_by,
      sort_order,
      query,
    }
  });
  const { rows: applications = [], total } = data || {};

  const loadMoreCollections = React.useCallback(() => {
    if (total <= applications.length) {
      return;
    }
    setPage(page + 1);
  }, [applications.length, total, page, setPage]);

  useApplicationDispatchQueryParams(page, selectedTagIds, query);

  return (
    <>
      <CardList
        cardList={applications}
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
        cardType={ContentType.ApplicationLatest}
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
import { usePublicPromptListQuery } from '@/api/prompts.js';
import { ContentType, ViewMode } from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import CardList from '@/components/CardList';
import Categories from '@/components/Categories';
import Toast from '@/components/Toast.jsx';
import useCardList from '@/components/useCardList';
import * as React from 'react';
import { useSelector } from 'react-redux';
import TrendingAuthors from '@/components/TrendingAuthors';
import { usePageQuery, useSortQueryParamsFromUrl } from '@/pages/hooks';
import { rightPanelStyle, tagsStyle } from '../MyLibrary/CommonStyles';

const emptyListPlaceHolder = <div>No public prompts yet. <br />Publish yours now!</div>;
const emptySearchedListPlaceHolder = <div>No prompts found yet. <br />Publish yours now!</div>;

const Top = () => {
  const {
    renderCard,
  } = useCardList(ViewMode.Public);
  const { query, page, setPage, tagList, selectedTagIds, calculateTagsWidthOnCard } = usePageQuery();
  const { sort_by, sort_order } = useSortQueryParamsFromUrl({ defaultSortOrder: 'desc', defaultSortBy: 'created_at' })
  const { data, error, isError, isLoading, isFetching } = usePublicPromptListQuery({
    page,
    params: {
      tags: selectedTagIds,
      sort_by,
      sort_order,
      query,
    }
  });

  const { total } = data || {};
  
  const { filteredList } = useSelector((state) => state.prompts);
  const loadMorePrompts = React.useCallback(() => {
    const existsMore = total && filteredList.length < total;
    if (!existsMore) return;
    setPage(page + 1);
  }, [total, filteredList.length, setPage, page]);

  
  React.useEffect(() => {
    if(data){
      calculateTagsWidthOnCard();
    }
  }, [calculateTagsWidthOnCard, data]);

  return (
    <>
      <CardList
        cardList={filteredList}
        total={total}
        isLoading={isLoading}
        isError={isError}
        rightPanelOffset={'82px'}
        rightPanelContent={
          <div style={rightPanelStyle}>
            <Categories tagList={tagList} style={tagsStyle}/>
            <TrendingAuthors />
          </div>
        }
        renderCard={renderCard}
        isLoadingMore={isFetching}
        loadMoreFunc={loadMorePrompts}
        cardType={ContentType.PromptsTop}
        emptyListPlaceHolder={query ? emptySearchedListPlaceHolder : emptyListPlaceHolder}
        />
      <Toast
        open={isError && !!page}
        severity={'error'}
        message={buildErrorMessage(error)}
      />
    </>
  );
};

export default Top;

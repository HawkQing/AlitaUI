/* eslint-disable no-unused-vars */
import { ContentType, ViewMode } from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import CardList from '@/components/CardList';
import Categories from '@/components/Categories';
import Toast from '@/components/Toast.jsx';
import useCardList from '@/components/useCardList';
import * as React from 'react';
import TrendingAuthors from '@/components/TrendingAuthors';
import { usePageQuery } from '@/pages/hooks';
import { rightPanelStyle, tagsStyle } from '../MyLibrary/CommonStyles';

const emptyListPlaceHolder = <div>No public applications yet. <br />Publish yours now!</div>;
const emptySearchedListPlaceHolder = <div>No applications found. <br />Create yours now!</div>;

const Top = () => {
  const {
    renderCard,
    PAGE_SIZE
  } = useCardList(ViewMode.Public);
  const { query, page, setPage, tagList, selectedTagIds } = usePageQuery();

  const isError = false;
  const isMoreError = false;
  const filteredList = [];
  const isLoading = false;
  const isLoadingMore = false;
  const error = undefined;

  return (
    <>
      <CardList
        cardList={filteredList}
        total={filteredList.length}
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
        isLoadingMore={isLoadingMore}
        loadMoreFunc={undefined}
        cardType={ContentType.ApplicationTop}
        emptyListPlaceHolder={emptyListPlaceHolder}
      />
      <Toast
        open={isMoreError}
        severity={'error'}
        message={buildErrorMessage(error)}
      />
    </>
  );
};

export default Top;

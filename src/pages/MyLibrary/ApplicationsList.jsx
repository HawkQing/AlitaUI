import { ContentType, ViewMode } from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import CardList from '@/components/CardList';
import Toast from '@/components/Toast.jsx';
import useCardList from '@/components/useCardList';
import { useViewMode } from '@/pages/hooks';
import * as React from 'react';
import { useSelector } from 'react-redux';
import RightPanel from './RightPanel';
import { useLoadApplications } from './useLoadApplications';

const EmptyListPlaceHolder = ({ query, viewMode, name }) => {
  if (!query) {
    if (viewMode !== ViewMode.Owner) {
      return <div>{`${name} has not created application yet.`}</div>
    } else {
      return <div>You have not created application yet. <br />Create yours now!</div>
    }
  } else {
    return <div>Nothing found. <br />Create yours now!</div>;
  }
};

const ApplicationsList = ({
  rightPanelOffset,
  sortBy,
  sortOrder,
  statuses,
}) => {
  const viewMode = useViewMode();
  const {
    renderCard,
  } = useCardList(viewMode);
  const { name } = useSelector((state) => state.trendingAuthor.authorDetails);

  const {
    onLoadMoreApplications,
    data,
    isApplicationsError,
    isMoreApplicationsError,
    isApplicationsFirstFetching,
    isApplicationsFetching,
    isApplicationsLoading,
    applicationsError,
    tagList, 
  } = useLoadApplications(viewMode, sortBy, sortOrder, statuses);

  const { rows: applications = [], total = 1 } = data || {};

  const loadMoreItems = React.useCallback(() => {
    const existsMore = applications.length < total;
    if (!existsMore || isApplicationsFetching) return;
    onLoadMoreApplications();
  }, [applications.length, total, isApplicationsFetching, onLoadMoreApplications]);

  return (
    <>
      <CardList
        key={'ApplicationsList'}
        cardList={applications}
        total={total}
        isLoading={isApplicationsLoading || isApplicationsFirstFetching}
        isError={isApplicationsError}
        rightPanelOffset={rightPanelOffset}
        rightPanelContent={<RightPanel tagList={tagList} />}
        renderCard={renderCard}
        isLoadingMore={isApplicationsFetching}
        loadMoreFunc={loadMoreItems}
        cardType={viewMode === ViewMode.Owner ? ContentType.MyLibraryApplications : ContentType.UserPublicApplications}
        emptyListPlaceHolder={<EmptyListPlaceHolder viewMode={viewMode} name={name} />}
      />
      <Toast
        open={isMoreApplicationsError}
        severity={'error'}
        message={buildErrorMessage(applicationsError)}
      />
    </>
  );
};

export default ApplicationsList;

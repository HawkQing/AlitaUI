import { useTrendingAuthorsListQuery } from "@/api/mock";
import { PUBLIC_PROJECT_ID } from '@/common/constants';
import { useSelector } from "react-redux";
import PeopleList from '@/components/PeopleList';

const TrendingAuthors = () => {
  const { trendingAuthorsList } = useSelector(state => state.mock);
  const { isSuccess, isError, isLoading } = useTrendingAuthorsListQuery(PUBLIC_PROJECT_ID);
  return (
    <PeopleList
      title={'Trending Authors'}
      people={trendingAuthorsList}
      isSuccess={isSuccess}
      isError={isError}
      isLoading={isLoading}
    />
  );
}

export default TrendingAuthors;
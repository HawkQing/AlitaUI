import { useLazyApplicationDetailsQuery } from '@/api/applications'

const useQueryApplicationDetail = () => {
  // eslint-disable-next-line no-unused-vars
  const [getApplicationDetail, { data: applicationDetail, isFetching, isError, isSuccess }] = useLazyApplicationDetailsQuery();
  return {
    getApplicationDetail,
    applicationDetail,
    isFetching,
  }
}

export default useQueryApplicationDetail;
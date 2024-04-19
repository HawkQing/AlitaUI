import { useLazyDatasourceDetailsQuery } from '@/api/datasources';

const useQueryDataSourceDetail = () => {
    // eslint-disable-next-line no-unused-vars
  const [getDatasourceDetail, { data: datasourceDetail, isFetching, isError, isSuccess }] = useLazyDatasourceDetailsQuery()
  return {
    getDatasourceDetail,
    datasourceDetail,
    isFetching,
  }
}

export default useQueryDataSourceDetail;
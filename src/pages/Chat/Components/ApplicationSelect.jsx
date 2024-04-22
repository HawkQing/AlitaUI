import SingleSelectWithSearch from "@/components/SingleSelectWithSearch";
import { useApplicationOptions } from "@/pages/MyLibrary/useApplicationOptions";
import { useMemo, useState } from "react";


export default function ApplicationSelect({
  onValueChange = () => { },
  value = {},
  required,
  error,
  helperText,
  shouldUseSelectedProject,
}) {
  const [query, setQuery] = useState('');
  const { data = {}, isFetching, onLoadMore } = useApplicationOptions({query, shouldUseSelectedProject});
  const dataSourceOptions = useMemo(() =>
    (data.rows || []).map(({ name, id, description }) =>
      ({ label: name, value: id, description })), [data]);

  return (
    <SingleSelectWithSearch
      required={required}
      label='Application'
      value={value}
      onValueChange={onValueChange}
      searchString={query}
      onSearch={setQuery}
      options={dataSourceOptions}
      isFetching={isFetching}
      onLoadMore={onLoadMore}
      error={error}
      helperText={helperText}
      maxListHeight={'400px'}
    />
  )
}
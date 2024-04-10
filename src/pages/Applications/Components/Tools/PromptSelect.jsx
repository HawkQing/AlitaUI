import { useGetPromptQuery, useGetVersionDetailQuery } from "@/api/prompts";
import BasicAccordion from "@/components/BasicAccordion";
import SingleSelect from "@/components/SingleSelect";
import SingleSelectWithSearch from "@/components/SingleSelectWithSearch";
import { usePromptOptions } from "@/pages/MyLibrary/usePromptOptions";
import VariableList from "@/pages/Prompts/Components/Form/VariableList";
import { buildVersionOption } from "@/pages/Prompts/Components/Form/VersionSelect";
import { useProjectId } from "@/pages/hooks";
import { Box } from "@mui/material";
import { useEffect, useMemo, useState, useRef } from "react";


export default function PromptSelect({
  onValueChange = () => { },
  value = '',
  version = '',
  onVersionChange = () => { },
  variables = [],
  onChangeVariable = () => { },
  onChangeVariables = () => { },
  required,
  error
}) {
  const [query, setQuery] = useState('');
  const onChangeVariablesRef = useRef(onChangeVariables)
  const { data = {}, isFetching, onLoadMore } = usePromptOptions(query);
  const options = useMemo(() =>
    (data.rows || []).map(({ name, id, description }) =>
      ({ label: name, value: id, description })), [data]);

  const projectId = useProjectId();
  const { data: promptDetail = {} } =
    useGetPromptQuery({ projectId, promptId: value }, { skip: !projectId || !value });
  const versionOptions = useMemo(() =>
    promptDetail.versions?.map(buildVersionOption(true)) || [], [promptDetail.versions]);
  
  const { data: versionDetail = {} } =
    useGetVersionDetailQuery({ projectId, promptId: value, version }, { skip: !projectId || !value || !version });

  useEffect(() => {
    if (versionDetail?.variables) {
      onChangeVariablesRef.current(versionDetail?.variables);
    }
  }, [versionDetail?.variables]);

  useEffect(() => {
    onChangeVariablesRef.current = onChangeVariables
  }, [onChangeVariables])
  
  return (
    <>
      <SingleSelectWithSearch
        required={required}
        label='Prompt'
        value={value}
        onValueChange={onValueChange}
        searchString={query}
        onSearch={setQuery}
        options={options}
        isFetching={isFetching}
        onLoadMore={onLoadMore}
        error={error?.prompt}
        helperText={error?.prompt}
      />
      <SingleSelect
        showBorder={true}
        required={required}
        label='Version'
        value={version}
        onValueChange={onVersionChange}
        options={versionOptions}
        error={error?.version}
        helperText={error?.version}
        disabled={!value}
        enableVersionListAvatar
        showOptionIcon
        sx={{ marginTop: '18px' }}
      />
      <Box display='flex' flexDirection='column' height='100%'>
        {variables?.length > 0 ? <BasicAccordion
          style={{ marginBottom: '24px' }}
          items={[
            {
              title: 'Variables',
              content: (
                <div>
                  <VariableList
                    variables={variables}
                    onChangeVariable={onChangeVariable}
                    showexpandicon='true'
                    multiline
                    collapseContent
                  />
                </div>
              ),
            },
          ]}
        /> : null}
      </Box>
    </>
  )
}
import MultipleSelect from "@/components/MultipleSelect";
import FormInput from "@/pages/DataSources/Components/Sources/FormInput";
import { useCallback, useMemo, useState } from "react";
import DatasourceSelect from "./DatasourceSelect";
import ToolFormBackButton from "./ToolFormBackButton";
import { ActionOptions, ToolTypes } from "./consts";
import useChangeFormikTools from './useChangeFormikTools';
import { updateObjectByPath } from '@/common/utils.jsx';

export default function ToolDatasource({
  editToolDetail = {},
  setEditToolDetail = () => { },
  handleGoBack
}) {
  const {
    index,
    name = '',
    description = '',
    settings = {},
  } = editToolDetail;
  const { selected_tools, datasource_id } = settings;
  const { isAdding, onChangeTools } = useChangeFormikTools({ toolIndex: index })
  const [isValidating, setIsValidating] = useState(false);
  const error = useMemo(() => {
    const helperText = 'Field is required';
    return {
      name: !name?.trim() ? helperText : undefined,
      description: !description?.trim() ? helperText : undefined,
      datasource: !datasource_id ? helperText : undefined,
      selected_tools: selected_tools?.length < 1 ? helperText : undefined,
    }
  }, [selected_tools?.length, datasource_id, description, name])

  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((field) => (value) => {
    const newTool = updateObjectByPath(editToolDetail, field, value)
    setEditToolDetail(newTool)
    onChangeTools(newTool)
    setIsDirty(true);
  }, [editToolDetail, onChangeTools, setEditToolDetail]);

  const handleInputChange = useCallback((field) => (event) => {
    handleChange(field)(event.target.value)
  }, [handleChange]);

  const validate = useCallback(() => {
    setIsValidating(true);
    return Object.values(error).some(item => !!item)
  }, [error]);

  const onChangeDatasource = useCallback(
    (datasource) => {
      const newToolWithId = updateObjectByPath(editToolDetail, 'settings.datasource_id', datasource.value)
      const newToolWithName = updateObjectByPath(newToolWithId, 'name', datasource.label)
      const newToolWithDescription = updateObjectByPath(newToolWithName, 'description', datasource.description)
      setEditToolDetail(newToolWithDescription)
      onChangeTools(newToolWithDescription)
      setIsDirty(true);
    },
    [editToolDetail, onChangeTools, setEditToolDetail],
  )

  return (
    <>
      <ToolFormBackButton
        label='New datasource tool'
        isAdding={isAdding}
        isDirty={isDirty}
        validate={validate}
        toolType={ToolTypes.datasource.label.toLowerCase()}
        handleGoBack={handleGoBack}
      />
      <FormInput
        required
        label='Name'
        value={name}
        onChange={handleInputChange('name')}
        error={isValidating && error.name}
        helperText={isValidating && error.name}
      />
      <FormInput
        inputEnhancer
        required
        autoComplete="off"
        showexpandicon='true'
        id='tool-description'
        label='Description'
        multiline
        maxRows={15}
        value={description}
        onChange={handleInputChange('description')}
        error={isValidating && error.description}
        helperText={isValidating && error.description}
      />
      <DatasourceSelect
        required
        onValueChange={onChangeDatasource}
        value={datasource_id}
        error={isValidating && error.datasource}
        helperText={isValidating && error.datasource}
      />
      <MultipleSelect
        showBorder
        required
        multiple
        label='Actions'
        emptyPlaceHolder=''
        onValueChange={handleChange('settings.selected_tools')}
        value={selected_tools}
        options={ActionOptions}
        customSelectedFontSize={'0.875rem'}
        error={isValidating && error.selected_tools}
        helperText={isValidating && error.selected_tools}
        sx={{
          marginTop: '8px !important',
          '& .MuiInputLabel-shrink': {
            fontSize: '16px',
            lineHeight: '21px',
            fontWeight: 400,
          },
        }}
        labelSX={{ left: '12px' }}
        selectSX={{
          paddingBottom: '8px !important',
          '& .MuiSelect-icon': {
            top: 'calc(50% - 18px);',
          },
        }}
      />
    </>
  )
}
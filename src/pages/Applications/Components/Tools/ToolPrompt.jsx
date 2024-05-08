import FormInput from "@/pages/DataSources/Components/Sources/FormInput";
import { useCallback, useMemo, useState } from "react";
import PromptSelect from "./PromptSelect";
import ToolFormBackButton from "./ToolFormBackButton";
import useChangeFormikTools from './useChangeFormikTools';
import { updateObjectByPath } from '@/common/utils.jsx';

export default function ToolPrompt({
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
  const { prompt_id, prompt_version_id, variables } = settings
  const { isAdding, onChangeTools } = useChangeFormikTools({ toolIndex: index })
  const [isValidating, setIsValidating] = useState(false);
  const error = useMemo(() => {
    const helperText = 'Field is required';
    return {
      name: !name?.trim() ? helperText : undefined,
      description: !description?.trim() ? helperText : undefined,
      prompt: !prompt_id ? helperText : undefined,
      version: !prompt_version_id ? helperText : undefined,
    }
  }, [name, description, prompt_id, prompt_version_id])

  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((field) => (value) => {
    const newTool = {
      ...editToolDetail,
      [field]: value
    }
    setEditToolDetail(newTool)
    onChangeTools(newTool)
    setIsDirty(true);
  }, [editToolDetail, onChangeTools, setEditToolDetail]);

  const handleInputChange = useCallback((field) => (event) => {
    handleChange(field)(event.target.value)
  }, [handleChange]);

  const handlePromptChange = useCallback((value) => {
    const newToolWithId = updateObjectByPath(editToolDetail, 'settings.prompt_id', value.value)
    const newToolWithName = name ? newToolWithId : updateObjectByPath(newToolWithId, 'name', value.label)
    const newToolWithDescription = description ? newToolWithName : updateObjectByPath(newToolWithName, 'description', value.description)
    setEditToolDetail(newToolWithDescription)
    onChangeTools(newToolWithDescription)
    setIsDirty(true);
  }, [description, editToolDetail, name, onChangeTools, setEditToolDetail]);

  const handleVersionChange = useCallback((value) => {
    const newTool = {
      ...editToolDetail,
      settings: {
        prompt_id,
        prompt_version_id: value,
        variables: [],
      }
    }
    setEditToolDetail(newTool)
    onChangeTools(newTool)
    setIsDirty(true);
  }, [editToolDetail, onChangeTools, prompt_id, setEditToolDetail]);

  const onChangeVariables = useCallback((newValues) => {
    const newTool = {
      ...editToolDetail,
      settings: {
        prompt_id,
        prompt_version_id,
        variables: newValues.map(item => ({
          name: item.key || item.name,
          value: item.value
        }))
      }

    }
    setEditToolDetail(newTool)
    onChangeTools(newTool)
    setIsDirty(true);
  }, [editToolDetail, onChangeTools, prompt_id, prompt_version_id, setEditToolDetail]);

  const onChangeVariable = useCallback((label, newValue) => {
    const updateIndex = Object.keys(variables).find(key => key === label);
    const newTool = {
      ...editToolDetail,
      variables: variables.map((item, i) => {
        if (i === updateIndex) {
          return {
            ...item,
            name: item.key || item.name,
            value: newValue
          }
        }
        return item
      })
    }
    setEditToolDetail(newTool)
    onChangeTools(newTool)
    setIsDirty(true);
  }, [editToolDetail, onChangeTools, setEditToolDetail, variables])

  const validate = useCallback(() => {
    setIsValidating(true);
    return Object.values(error).some(item => !!item)
  }, [error]);

  return (
    <>
      <ToolFormBackButton
        label='New prompt tool'
        isAdding={isAdding}
        isDirty={isDirty}
        validate={validate}
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
      <PromptSelect
        required
        onValueChange={handlePromptChange}
        value={prompt_id}
        onVersionChange={handleVersionChange}
        version={prompt_version_id}
        variables={variables}
        onChangeVariable={onChangeVariable}
        onChangeVariables={onChangeVariables}
        error={isValidating && error}
      />
    </>
  )
}
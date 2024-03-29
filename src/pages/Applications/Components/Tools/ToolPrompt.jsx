import FormInput from "@/pages/DataSources/Components/Sources/FormInput";
import { useFormikContext } from "formik";
import { useCallback, useMemo, useState } from "react";
import PromptSelect from "./PromptSelect";
import ToolFormBackButton from "./ToolFormBackButton";

export default function ToolPrompt({
  editToolDetail = {},
  setEditToolDetail = () => { },
  handleGoBack
}) {
  const {
    index,
    name = '',
    description = '',
    prompt = '',
    version = undefined,
    variables = [],
  } = editToolDetail;
  const { values } = useFormikContext();
  const isAdding = useMemo(() => index === (values?.tools || []).length, [index, values?.tools]);
  const [isValidating, setIsValidating] = useState(false);
  const error = useMemo(() => {
    const helperText = 'Field is required';
    return {
      name: !name?.trim() ? helperText : undefined,
      description: !description?.trim() ? helperText : undefined,
      prompt: !prompt.value ? helperText : undefined,
      version: !version ? helperText : undefined,
    }
  }, [name, description, prompt.value, version])

  const [isDirty, setIsDirty] = useState(false);

  const handleChange = useCallback((field) => (value) => {
    setEditToolDetail({
      ...editToolDetail,
      [field]: value
    })
    setIsDirty(true);
  }, [editToolDetail, setEditToolDetail]);

  const handleInputChange = useCallback((field) => (event) => {
    handleChange(field)(event.target.value)
  }, [handleChange]);

  const handlePromptChange = useCallback((value) => {
    setEditToolDetail({
      ...editToolDetail,
      prompt: value,
      version: null,
      variables: []
    })
    setIsDirty(true);
  }, [editToolDetail, setEditToolDetail]);

  const handleVersionChange = useCallback((value) => {
    setEditToolDetail({
      ...editToolDetail,
      version: value,
      variables: []
    })
    setIsDirty(true);
  }, [editToolDetail, setEditToolDetail]);

  const onChangeVariables = useCallback((newValues) => {
    setEditToolDetail({
      ...editToolDetail,
      variables: newValues.map(item => ({
        key: item.key || item.name,
        value: item.value
      }))
    })
    setIsDirty(true);
  }, [editToolDetail, setEditToolDetail]);

  const onChangeVariable = useCallback((label, newValue) => {
    const updateIndex = Object.keys(variables).find(key => key === label);
    setEditToolDetail({
      ...editToolDetail,
      variables: variables.map((item, i) => {
        if (i === updateIndex) {
          return {
            ...item,
            value: newValue
          }
        }
        return item
      })
    })
    setIsDirty(true);
  }, [editToolDetail, setEditToolDetail, variables])

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
        value={prompt}
        onVersionChange={handleVersionChange}
        version={version}
        variables={variables}
        onChangeVariable={onChangeVariable}
        onChangeVariables={onChangeVariables}
        error={isValidating && error}
      />
    </>
  )
}
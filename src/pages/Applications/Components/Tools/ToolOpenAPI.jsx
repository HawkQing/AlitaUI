import FormInput from "@/pages/DataSources/Components/Sources/FormInput";
import { useCallback, useState, useMemo } from "react";
import AuthenticationSelect from "./AuthenticationSelect";
import ToolFormBackButton from "./ToolFormBackButton";
import OpenAPISchemaInput from './OpenAPISchemaInput';
import OpenAPIActions from './OpenAPIActions';
import { AuthenticationTypes, AuthTypes } from '@/common/constants';
import useChangeFormikTools from './useChangeFormikTools';
import { updateObjectByPath } from '@/common/utils.jsx';

const helperText = (field) => `${field} field is required`;

export default function ToolOpenAPI({
  editToolDetail = {},
  setEditToolDetail = () => { },
  handleGoBack
}) {
  const {
    index,
    name = '',
    settings = {
      schema_settings: '',
      authentication: {
        type: '',
        settings: {}
      },
      selected_tools: []
    },
  } = editToolDetail;
  const { schema_settings: schema,  authentication = { type: '', settings: {} }, selected_tools = [] } = settings;
  const { isAdding, onChangeTools } = useChangeFormikTools({toolIndex: index})
  const { type: authentication_type, settings: authentication_settings } = authentication;

  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const error = useMemo(() => {
    const result = {
      name: !name?.trim() ? helperText(name) : undefined,
    };
    if (authentication_type === AuthenticationTypes.APIKey.value) {
      result['api_key'] = !authentication_settings.api_key ? helperText('API key') : undefined
      if (authentication_settings.auth_type === AuthTypes.Custom.value) {
        result['custom_header_name'] = !authentication_settings.custom_header_name ? helperText('Custom header') : undefined
      }
    }
    if (authentication_type === AuthenticationTypes.OAuth.value) {
      result['client_id'] = !authentication_settings.client_id ? helperText('client_id') : undefined
      result['client_secret'] = !authentication_settings.client_secret ? helperText('client_secret') : undefined
      result['auth_url'] = !authentication_settings.auth_url ? helperText('auth_url') : undefined
      result['token_url'] = !authentication_settings.token_url ? helperText('token_url') : undefined
      result['scope'] = !authentication_settings.scope ? helperText('scope') : undefined
    }
    return result
  }, [
    authentication_settings.api_key,
    authentication_settings.auth_type,
    authentication_settings.custom_header_name,
    authentication_settings.client_id,
    authentication_settings.client_secret,
    authentication_settings.auth_url,
    authentication_settings.token_url,
    authentication_settings.scope,
    authentication_type, name])
  
  const handleChange = useCallback((field) => (value) => {
    const newTool = {
      ...editToolDetail,
      [field]: value
    };
    setEditToolDetail(newTool)
    onChangeTools(newTool)
    setIsDirty(true);
  }, [editToolDetail, onChangeTools, setEditToolDetail]);

  const handleSchemaChange = useCallback((value) => {
    const newToolWithSchema = updateObjectByPath(editToolDetail, 'settings.schema_settings', value.schema)
    const newToolWithActions = updateObjectByPath(newToolWithSchema, 'settings.selected_tools', value.selected_tools)
    setEditToolDetail(newToolWithActions)
    onChangeTools(newToolWithActions)
    setIsDirty(true);
  }, [editToolDetail, onChangeTools, setEditToolDetail]);

  const handleAuthenticationChange = useCallback((value) => {
    const newTool = updateObjectByPath(editToolDetail, 'settings.authentication', value)
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

  return (
    <>
      <ToolFormBackButton
        isAdding={isAdding}
        label='New Open API tool'
        isDirty={isDirty}
        validate={validate}
        handleGoBack={handleGoBack}
      />
      <FormInput
        required
        label='Name'
        value={name}
        onChange={handleInputChange('name')}
        error={isValidating && !!error.name}
        helperText={isValidating && error.name}
      />
      <OpenAPISchemaInput
        value={schema}
        // eslint-disable-next-line react/jsx-no-bind
        onValueChange={(schemaText, schemaActions) => {
          handleSchemaChange({
            schema: schemaText,
            selected_tools: schemaActions
          })
        }} />
      <OpenAPIActions selected_tools={selected_tools} />
      <AuthenticationSelect
        onValueChange={handleAuthenticationChange}
        value={authentication}
        error={
          isValidating && (
            error.api_key ||
            error.custom_header_name ||
            error.client_id ||
            error.client_secret ||
            error.auth_url ||
            error.token_url ||
            error.scope)}
      />
    </>
  )
}
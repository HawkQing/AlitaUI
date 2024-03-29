import FormInput from "@/pages/DataSources/Components/Sources/FormInput";
import { useCallback, useState, useMemo } from "react";
import AuthenticationSelect from "./AuthenticationSelect";
import ToolFormBackButton from "./ToolFormBackButton";
import OpenAPISchemaInput from './OpenAPISchemaInput';
import OpenAPIActions from './OpenAPIActions';
import { AuthenticationTypes, AuthTypes } from '@/common/constants';

const helperText = (field) => `${field} field is required`;

export default function ToolOpenAPI({
  editToolDetail = {},
  setEditToolDetail = () => { },
  handleGoBack
}) {
  const {
    name = '',
    schema = '',
    authentication,
    actions = [],
  } = editToolDetail;
  const { authentication_type, oauth_settings, api_key_settings } = authentication;

  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const error = useMemo(() => {
    const result = {
      name: !name?.trim() ? helperText(name) : undefined,
    };
    if (authentication_type === AuthenticationTypes.APIKey.value) {
      result['api_key'] = !api_key_settings.api_key ? helperText('API key') : undefined
      if (api_key_settings.auth_type === AuthTypes.Custom.value) {
        result['custom_header'] = !api_key_settings.custom_header ? helperText('Custom header') : undefined
      }
    }
    if (authentication_type === AuthenticationTypes.OAuth.value) {
      result['client_id'] = !oauth_settings.client_id ? helperText('client_id') : undefined
      result['client_secret'] = !oauth_settings.client_secret ? helperText('client_secret') : undefined
      result['authorization_url'] = !oauth_settings.authorization_url ? helperText('authorization_url') : undefined
      result['token_url'] = !oauth_settings.token_url ? helperText('token_url') : undefined
      result['scope'] = !oauth_settings.scope ? helperText('scope') : undefined
    }
    return result
  }, [
    api_key_settings.api_key,
    api_key_settings.auth_type,
    api_key_settings.custom_header,
    oauth_settings.client_id,
    oauth_settings.client_secret,
    oauth_settings.authorization_url,
    oauth_settings.token_url,
    oauth_settings.scope,
    authentication_type, name])

  const handleChange = useCallback((field) => (value) => {
    setEditToolDetail({
      ...editToolDetail,
      [field]: value
    })
    setIsDirty(true);
  }, [editToolDetail, setEditToolDetail]);

  const handleBatchChange = useCallback((value) => {
    setEditToolDetail({
      ...editToolDetail,
      ...value
    })
    setIsDirty(true);
  }, [editToolDetail, setEditToolDetail]);

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
          handleBatchChange({
            schema: schemaText,
            actions: schemaActions
          })
        }} />
      <OpenAPIActions actions={actions} />
      <AuthenticationSelect
        onValueChange={handleChange('authentication')}
        value={authentication}
        error={
          isValidating && (
            error.api_key ||
            error.custom_header ||
            error.client_id ||
            error.client_secret ||
            error.authorization_url ||
            error.token_url ||
            error.scope)}
      />
    </>
  )
}
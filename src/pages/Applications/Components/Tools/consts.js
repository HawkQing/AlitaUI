import { OAuthTokenExchangeMethods, APIKeyTypes, AuthTypes } from '@/common/constants';

export const ToolTypes = {
  datasource: {
    label: 'Datasource',
    value: 'datasource'
  },
  open_api: {
    label: 'Open API',
    value: 'open_api'
  },
  prompt: {
    label: 'Prompt',
    value: 'prompt'
  },
  custom: {
    label: 'Custom',
    value: 'custom'
  },
}

export const ActionTypes = {
  chat: {
    label: 'Chat',
    value: 'chat'
  },
  search: {
    label: 'Search',
    value: 'search'
  }
}

export const ActionOptions = Object.values(ActionTypes);

const initialOAuthSetting = {
  client_id: '',
  client_secret: '',
  authorization_url: '',
  token_url: '',
  scope: '',
  token_exchange_method: OAuthTokenExchangeMethods.Default.value,
}

const initialAPIKeySetting = {
  api_key: '',
  api_key_type: APIKeyTypes.Password.value,
  auth_type: AuthTypes.Basic.value,
  custom_header: '',
}

export const ToolInitialValues = {
  [ToolTypes.datasource.value]: {
    type: ToolTypes.datasource.value,
    name: '',
    description: '',
    datasource: '',
    actions: [],
  },
  [ToolTypes.open_api.value]: {
    type: ToolTypes.open_api.value,
    name: '',
    schema: '',
    authentication: {
      authentication_type: '', 
      oauth_settings: initialOAuthSetting, 
      api_key_settings: initialAPIKeySetting,
    },
    actions: [],
  },
  [ToolTypes.custom.value]: {
    type: ToolTypes.custom.value,
    name: '',
    schema: '',
  }
}
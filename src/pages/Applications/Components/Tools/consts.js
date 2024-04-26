import { AuthenticationTypes } from '@/common/constants';

export const ToolTypes = {
  datasource: {
    label: 'Datasource',
    value: 'datasource'
  },
  open_api: {
    label: 'Open API',
    value: 'openapi'
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

export const ToolInitialValues = {
  [ToolTypes.datasource.value]: {
    type: ToolTypes.datasource.value,
    name: '',
    description: '',
    settings: {
      datasource_id: '',
      selected_tools: [],
    },
  },
  [ToolTypes.open_api.value]: {
    type: ToolTypes.open_api.value,
    name: '',
    settings: {
      schema_settings: "",
      selected_tools: [],
      authentication: {
          type: AuthenticationTypes.None.value,
          settings: {
          }
      }
    },
  },
  [ToolTypes.prompt.value]: {
    type: ToolTypes.prompt.value,
    name: '',
    description: '',
    settings: {
      prompt_id: '',
      prompt_version_id: '',
      variables: []
    }
  },
  [ToolTypes.custom.value]: {
    type: ToolTypes.custom.value,
    name: 'Custom tool',
    settings: {
      custom_json: '',
    },
  }
}
# Alita UI
React UI for the Alita Hub. Provides a prompt library and conversational interface to interact with various LLMs.

## Features
- Persisted Prompt Library
- Chat interface for conversations
- Integration with Alita API for AI processing

## Stack
- [React](https://reactjs.org/) - Frontend framework
- [Redux Toolkit (RTK)](https://redux-toolkit.js.org/rtk-query/overview)  - State management
- [MUI (Material UI)](https://mui.com/material-ui/getting-started/) - UI styling and components
- [React router](https://reactrouter.com/en/main/router-components/browser-router) - Routing and navigation
- [Alita Hub API](https://www.postman.com/projectalita/workspace/centry) - Backend API for AI

## Getting Started

1. Install dependencies `npm install`
2. create `.env` file with following variables:
  - VITE_SERVER_URL=/api/v1
  - VITE_DEV_TOKEN=__your_personal_token__
  - VITE_BASE_URI=alita_ui
  - VITE_DEV_SERVER=https://eye.projectalita.ai
  - VITE_PUBLIC_PROJECT_ID=__your_project_id__
    
3. run dev server `npm run dev`

Contributing
Pull requests are welcome! Feel free to open issues to discuss improvements or bugs.

License
Apache 2.0

import { Box } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import { MuiMarkdown } from 'mui-markdown';

import { styled } from '@mui/material/styles';


import { useAskAlitaMutation } from '@/api/prompts';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { useSelector } from 'react-redux';
import AlitaIcon from '../Icons/AlitaIcon';
import ClearIcon from '../Icons/ClearIcon';
import SendIcon from '../Icons/SendIcon';

import { useCtrlEnterKeyEventsHandler } from './hooks';

const Alert = forwardRef(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


const ChatBoxContainer = styled(Box)(() => ({
  width: '100%',
  height: 445,
  display: 'flex',
  flexDirection: 'column',
}));

const StyledButton = styled(Button)(({ first, selected, theme }) => (`
  text-transform: none;
  display: flex;
  padding: 6px 16px;
  align-items: center;
  gap: 8px;
  border-radius:${first ? '8px 0px 0px 8px' : '0px 8px 8px 0px'};
  background:${selected ? 'rgba(255, 255, 255, 0.20)' : 'rgba(255, 255, 255, 0.05)'};
  color:${selected ? 'white' : theme.palette.text.primary};
  border-right: 0px !important;
`));

const ActionContainer = styled(Box)(() => ({
  width: '100%',
  height: 28,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
}));

const ActionButton = styled(IconButton)(() => (`
  width: 36px;
  height: 36px;
  display: flex;
  padding: 6px;
  align-items: center;
  gap: 4px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.10);
`));

const RunButton = styled(Button)(({ theme }) => (`
  display: flex;
  padding: 6px 16px;
  align-items: center;
  gap: 8px;
  border-radius: 28px;
  background: #6AE8FA;
  &:hover {
    background: #6AE8FA;
  }
  &.Mui-disabled {
    background-color: ${theme.palette.text.primary};
  }

  color: var(--Basic-Bgr, #0E131D);
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 16px; /* 133.333% */
  text-transform: none;

`));

const ChatBodyContainer = styled(Box)(() => `
  display: flex;
  height: 377px;
  padding: 12px 12px 0px 12px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  flex: 1 0 0;
  align-self: stretch;

  position: relative;

  border-radius: 8px;
  border: 1px solid #26323D;
`);

const ChatInputContainer = styled(Box)(() => `
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 12px 16px;
  align-items: center;
  gap: 8px;
  height: 68px;

  position: absolute;
  bottom: 0px;
  left: 0px;

  border-radius: 0px 0px 6px 6px;
  border-top: 1px solid #3B3E46;
  background: rgba(255, 255, 255, 0.05);
`);

const StyledTextField = styled(TextField)(() => `
  flex: 1 0 0;
  color: #FFF;

  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px; /* 157.143% */
`);

const SendButtonContainer = styled(Box)(() => (`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
`));

const SendButton = styled(IconButton)(({ theme }) => (`
  display: flex;
  padding: 6px;
  align-items: center;
  border-radius: 28px;
  background: #6AE8FA;
  &.Mui-disabled {
    background-color: ${theme.palette.text.primary};
  }
  &:hover {
    background: #6AE8FA;
  }
`));

const StyledCircleProgress = styled(CircularProgress)(() => `
  position: absolute;
  z-index: 999;
`)

const MessageList = styled(List)(() => `
  width: 100%;
  max-height: 323px;
  overflow: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  ::-webkit-scrollbar {
    width: 0 !important
  }
`)

const UserMessageContainer = styled(ListItem)(() => `
  flex: 1 0 0
  display: flex;
  padding: 12px;
  align-items: flex-start;
  // gap: 16px;
  align-self: stretch;
  border-radius: 4px;
`);

const Message = styled(Box)(() => `
  flex: 1 0 0;
  color: #FFF;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px; /* 157.143% */
  overflow-wrap: break-word;
  word-break: break-word;
`);

const Answer = styled(Box)(() => `
  flex: 1 0 0;
  color: #FFF;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px; /* 157.143% */
  overflow-wrap: break-word;
  word-break: break-word;
`);

const UserAvatar = styled(Avatar)(() => `
  padding: 0px;
`);

const AIAnswerContainer = styled(UserMessageContainer)(() => `
  background: #26323D;
`);

const UserMessage = ({ content }) => {
  const avatar = useSelector((state) => state.user?.avatar) || 'https://i.pravatar.cc/300?a=1'
  const userName = useSelector((state) => state.user?.avatar) || 'Bill Gates'
  return (
    <UserMessageContainer>
      <ListItemAvatar>
        <UserAvatar alt={userName} src={avatar} />
      </ListItemAvatar>
      <Message>
        <MuiMarkdown>
          {content}
        </MuiMarkdown>
      </Message>
    </UserMessageContainer>
  )
}

const AIAnswer = ({ answer }) => {
  return (
    <AIAnswerContainer>
      <ListItemAvatar>
        <UserAvatar>
          <AlitaIcon sx={{ fontSize: 40 }} />
        </UserAvatar>
      </ListItemAvatar>
      <Answer>
        <MuiMarkdown>
          {answer}
        </MuiMarkdown>
      </Answer>
    </AIAnswerContainer>
  )
}


export const ChatBoxMode = {
  'Chat': 'Chat',
  'Completion': 'Completion',
}

const ChatBox = ({
  prompt_id,
  integration_uid = '133f1010-fe15-46a5-ad5b-907332a0635e',
  model_name = 'gpt-3.5-turbo',
  temperature = 0.6,
  context = '',
  chat_history = [],
  max_tokens = 117,
  top_p = 0.5,
  variables = {},
}) => {
  const inputRef = useRef(null)
  const [askAlita, { isLoading, data, error, reset }] = useAskAlitaMutation();
  const [mode, setMode] = useState(ChatBoxMode.Chat);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [completionResult, setCompletionResult] = useState('');
  const [showError, setShowError] = useState(false);
  const onSelectChatMode = useCallback(
    (chatMode) => () => {
      if (mode !== chatMode) {
        setMode(chatMode);
        if (chatMode === ChatBoxMode.Completion) {
          setQuestion('');
        }
      }
    },
    [mode],
  );

  const onInputQuestion = useCallback(
    (event) => {
      setQuestion(event.target.value?.trim())
    },
    [],
  );

  const onClickSend = useCallback(
    async () => {
      setMessages((prevMessages) => {
        return [...prevMessages, {
          role: 'user',
          content: question,
        }]
      });
      if (inputRef.current) {
        inputRef.current.value = '';
      }

      askAlita({
        projectId: 9,
        context,
        prompt_id,
        integration_uid,
        "integration_settings": {
          model_name,
          temperature,
          max_tokens,
          top_p,
        },
        variables,
        "input": question,
        "chat_history": [...messages].reverse(),
      });

      setQuestion('');
    },
    [
      askAlita,
      context,
      integration_uid,
      max_tokens,
      messages,
      model_name,
      prompt_id,
      question,
      temperature,
      top_p,
      variables,
    ]);

  const onClearChat = useCallback(
    () => {
      setQuestion('');
      setMessages([]);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [],
  );

  const onClickRun = useCallback(
    () => {
      askAlita({
        projectId: 9,
        context,
        prompt_id,
        integration_uid,
        "integration_settings": {
          model_name,
          temperature,
          max_tokens,
          top_p,
        },
        "input": '',
        "chat_history": [...chat_history].reverse()
      });
    },
    [
      askAlita,
      chat_history,
      context,
      integration_uid,
      max_tokens,
      model_name,
      prompt_id,
      temperature,
      top_p]);

  const onCloseError = useCallback(
    () => {
      setShowError(false);
    },
    [],
  );

  const onCtrlEnterPressed = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = inputRef.current.value + '\n'
    }
  }, [])

  const onEnterPressed = useCallback(() => {
    if (mode === ChatBoxMode.Chat && !!question.trim()) {
      onClickSend()
    }
  }, [mode, onClickSend, question]);

  const { onKeyDown, onKeyUp, onCompositionStart, onCompositionEnd } = useCtrlEnterKeyEventsHandler(
    onCtrlEnterPressed,
    onEnterPressed,
  );

  useEffect(() => {
    if (data?.messages?.length) {
      if (mode === ChatBoxMode.Chat) {
        setMessages((prevMessages) => {
          return [...prevMessages, {
            role: 'ai',
            content: data.messages[0].content,
          }]
        })
      } else {
        setCompletionResult(data.messages[0].content);
      }
      reset();
    }
  }, [data, data?.messages, mode, reset]);

  useEffect(() => {
    if (error) {
      setShowError(true)
      reset();
    }
  }, [error, reset]);

  return (
    <Container >
      <ChatBoxContainer
        role="presentation"
      >
        <ActionContainer>
          <ButtonGroup
            disableElevation
            variant="contained"
            aria-label="chat action buttons"
          >
            <StyledButton
              onClick={onSelectChatMode(ChatBoxMode.Chat)}
              selected={mode === ChatBoxMode.Chat}
              first={'true'}
            >
              Chat
            </StyledButton>
            <StyledButton
              onClick={onSelectChatMode(ChatBoxMode.Completion)}
              selected={mode === ChatBoxMode.Completion}
            >
              Completion
            </StyledButton>
          </ButtonGroup>
          {
            mode === ChatBoxMode.Chat ?
              <ActionButton
                aria-label="clear the chat"
                onClick={onClearChat}
              >
                <ClearIcon sx={{ fontSize: 18 }} />
              </ActionButton>
              :
              <SendButtonContainer>
                <RunButton disabled={isLoading} onClick={onClickRun}>
                  Run
                </RunButton>
                {isLoading && <StyledCircleProgress />}
              </SendButtonContainer>
          }
        </ActionContainer>
        <ChatBodyContainer>
          {
            mode === ChatBoxMode.Chat
              ?
              <MessageList>
                {
                  messages.map((message, index) => {
                    return message.role === 'user' ?
                      <UserMessage key={message.role + index} content={message.content} />
                      :
                      <AIAnswer key={message.role + index} answer={message.content} />
                  })
                }
              </MessageList>
              :
              <Message >
                {completionResult}
              </Message>
          }
          {
            mode === ChatBoxMode.Chat &&
            <ChatInputContainer>
              <Box sx={{ flex: 1, marginRight: 1 }}>
                <StyledTextField
                  inputRef={inputRef}
                  autoFocus
                  fullWidth
                  id="standard-multiline-static"
                  label=""
                  multiline
                  rows={2}
                  variant="standard"
                  onChange={onInputQuestion}
                  onKeyDown={onKeyDown}
                  onKeyUp={onKeyUp}
                  onCompositionStart={onCompositionStart}
                  onCompositionEnd={onCompositionEnd}
                  disabled={isLoading}
                  placeholder="Ask your question here"
                  InputProps={{ disableUnderline: true }}
                />
              </Box>
              <SendButtonContainer>
                <SendButton
                  disabled={isLoading || !question}
                  onClick={onClickSend}
                  aria-label="send your question">
                  <SendIcon sx={{ fontSize: 18 }} />
                </SendButton>
                {isLoading && <StyledCircleProgress />}
              </SendButtonContainer>
            </ChatInputContainer>
          }
        </ChatBodyContainer>
      </ChatBoxContainer>
      <Snackbar open={showError} autoHideDuration={6000} onClose={onCloseError}>
        <Alert onClose={onCloseError} severity="error" sx={{ width: '100%' }}>
          {typeof error === 'string' ? error : error?.data?.error}
        </Alert>
      </Snackbar>
    </Container>
  )
};

ChatBox.propTypes = {
}


export default ChatBox;
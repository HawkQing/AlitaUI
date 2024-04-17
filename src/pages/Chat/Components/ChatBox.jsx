/* eslint-disable react/jsx-no-bind */
import { useAskAlitaMutation } from '@/api/prompts';
import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  ROLES,
  sioEvents,
  SocketMessageType,
  StreamingMessageType
} from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import useSocket, { useManualSocket } from "@/hooks/useSocket.jsx";
import { useProjectId } from '@/pages/hooks';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ChatInput from '@/components/ChatBox/ChatInput';
import Toast from '@/components/Toast.jsx';
import { useStopStreaming } from '@/components/ChatBox/hooks';
import { ChatBodyContainer, ChatBoxContainer, MessageList } from '@/components/ChatBox/StyledComponents';
import AlertDialog from '@/components/AlertDialog';
import UserMessage from '@/components/ChatBox/UserMessage';
import AIAnswer from '@/components/ChatBox/AIAnswer';
import { AUTO_SCROLL_KEY } from '@/components/ChatBox/AutoScrollToggle';
import useDeleteMessageAlert from '@/components/ChatBox/useDeleteMessageAlert';
import NewConversationSettings from './NewConversationSettings';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@emotion/react';

const USE_STREAM = true

const generatePayload = ({
  projectId, prompt_id, context, temperature,
  max_tokens, top_p, top_k, model_name, integration_uid,
  variables, messages, type, name, stream = true, currentVersionId
}) => ({
  prompt_id,
  projectId,

  user_name: name,
  project_id: projectId,
  prompt_version_id: currentVersionId,

  type,
  context,
  model_settings: {
    temperature,
    max_tokens,
    top_p,
    top_k,
    stream,
    model: {
      model_name,
      name: model_name, //TODO: (model_name) if the BE is ready, this "name" field should be removed
      integration_uid,
    }
  },
  variables: variables ? variables.map((item) => {
    const { key, value } = item;
    return {
      name: key,
      value,
    }
  }) : [],
  messages,
  format_response: true,
})

const generateChatPayload = ({
  projectId, prompt_id, context, temperature,
  max_tokens, top_p, top_k, model_name, integration_uid,
  variables, question, messages, chatHistory, name, stream = true,
  currentVersionId
}) => {
  const payload = generatePayload({
    projectId, prompt_id, context, temperature,
    max_tokens, top_p, top_k, model_name, integration_uid,
    variables, messages, type: 'chat', name, stream, currentVersionId
  })
  payload.chat_history = chatHistory ? chatHistory.map((message) => {
    const { role, content, name: userName } = message;
    if (userName) {
      return { role, content, name: userName };
    } else {
      return { role, content }
    }
  }) : []
  payload.user_input = question
  return payload
}


const ChatBox = forwardRef((props, boxRef) => {
  const theme = useTheme();
  const {
    prompt_id,
    integration_uid,
    model_name,
    temperature,
    context,
    messages,
    llm_settings = {},
    variables,
    currentVersionId,
    messageListSX,
    isNewConversation,
    onStartNewConversation
  } = props
  const { max_tokens = DEFAULT_MAX_TOKENS, top_p = DEFAULT_TOP_P, top_k = DEFAULT_TOP_K } = llm_settings
  const [askAlita, { isLoading, data, error, reset }] = useAskAlitaMutation();
  const { name } = useSelector(state => state.user)
  const [chatHistory, setChatHistory] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('info')
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [answerIdToRegenerate, setAnswerIdToRegenerate] = useState('');
  const projectId = useProjectId();
  const chatInput = useRef(null);
  const messagesEndRef = useRef();
  const listRefs = useRef([]);
  const chatHistoryRef = useRef(chatHistory);

  const [is_public, setIsPublic] = useState(false)
  const [selectedChatModel, setSelectedChatModel] = useState({})
  const [selectedChatDatasource, setSelectedChatDatasource] = useState();
  const [selectedChatApplication, setSelectedChatApplication] = useState();

  const {
    openAlert,
    alertContent,
    onDeleteAnswer,
    onDeleteAll,
    onConfirmDelete,
    onCloseAlert
  } = useDeleteMessageAlert({
    setChatHistory,
    chatInput,
  });

  const onClickClearChat = useCallback(() => {
    if (chatHistory.length) {
      onDeleteAll();
    }
  }, [chatHistory.length, onDeleteAll])

  useImperativeHandle(boxRef, () => ({
    onClear: onClickClearChat,
  }));

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  const getMessage = useCallback((messageId) => {
    const msgIdx = chatHistoryRef.current?.findIndex(i => i.id === messageId) || -1;
    let msg
    if (msgIdx < 0) {
      msg = {
        id: messageId,
        role: ROLES.Assistant,
        content: '',
        isLoading: false,
      }
    } else {
      msg = chatHistoryRef.current[msgIdx]
    }
    return [msgIdx, msg]
  }, [])

  const handleError = useCallback(
    (errorObj) => {
      setToastMessage(buildErrorMessage(errorObj));
      setToastSeverity('error');
      setShowToast(true);
      if (isRegenerating) {
        setAnswerIdToRegenerate('');
        setIsRegenerating(false);
      }
    },
    [isRegenerating],
  )

  const handleSocketEvent = useCallback(async message => {
    const { stream_id, type: socketMessageType, message_type, response_metadata } = message
    const [msgIndex, msg] = getMessage(stream_id, message_type)

    const scrollToMessageBottom = () => {
      if (sessionStorage.getItem(AUTO_SCROLL_KEY) === 'true') {
        (listRefs.current[msgIndex] || messagesEndRef?.current)?.scrollIntoView({ block: "end" });
      }
    };

    switch (socketMessageType) {
      case SocketMessageType.StartTask:
        msg.isLoading = true
        msg.isStreaming = false
        msg.content = ''
        msg.references = []
        msgIndex === -1 ? setChatHistory(prevState => [...prevState, msg]) : setChatHistory(prevState => {
          prevState[msgIndex] = msg
          return [...prevState]
        })
        setTimeout(scrollToMessageBottom, 0);
        break
      case SocketMessageType.Chunk:
      case SocketMessageType.AIMessageChunk:
        msg.content += message.content
        msg.isLoading = false
        msg.isStreaming = true
        setTimeout(scrollToMessageBottom, 0);
        if (response_metadata?.finish_reason) {
          if (message_type === StreamingMessageType.Freeform) {
            //
          } else {
            msg.isStreaming = false
          }
        }
        break
      case SocketMessageType.References:
        msg.references = message.references
        break
      case SocketMessageType.Error:
        msg.isStreaming = false
        handleError({ data: message.content || [] })
        return
      case SocketMessageType.Freeform:
        break
      default:
        // eslint-disable-next-line no-console
        console.warn('unknown message type', socketMessageType)
        return
    }
    msgIndex > -1 && setChatHistory(prevState => {
      prevState[msgIndex] = msg
      return [...prevState]
    })
  }, [getMessage, handleError])

  const { emit } = useSocket(sioEvents.promptlib_predict, handleSocketEvent)

  const onPredictStream = useCallback(question => {
    onStartNewConversation();
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ block: "end" });
    }, 0);
    setChatHistory((prevMessages) => {
      return [...prevMessages, {
        id: new Date().getTime(),
        role: ROLES.User,
        name,
        content: question,
      }]
    })
    const payload = generateChatPayload({
      projectId, prompt_id, context, temperature, max_tokens, top_p,
      top_k, model_name, integration_uid, variables, question, messages,
      chatHistory, name, stream: true, currentVersionId
    })
    emit(payload)
  },
    [
      messages,
      context,
      integration_uid,
      max_tokens,
      chatHistory,
      setChatHistory,
      model_name,
      name,
      prompt_id,
      temperature,
      top_p,
      top_k,
      variables,
      projectId,
      emit,
      currentVersionId,
      onStartNewConversation
    ])

  const onClickSend = useCallback(
    async (question) => {
      onStartNewConversation();
      const payload = generateChatPayload({
        projectId, prompt_id, context, temperature, max_tokens,
        top_p, top_k, model_name, integration_uid, variables,
        question, messages, chatHistory, name, stream: false,
        currentVersionId
      })
      setChatHistory((prevMessages) => {
        return [...prevMessages, {
          id: new Date().getTime(),
          role: 'user',
          name,
          content: question,
        }]
      });
      askAlita(payload);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ block: "end" });
      }, 0);
    },
    [
      askAlita,
      messages,
      context,
      integration_uid,
      max_tokens,
      chatHistory,
      model_name,
      name,
      prompt_id,
      temperature,
      top_p,
      top_k,
      variables,
      projectId,
      currentVersionId,
      onStartNewConversation
    ]);


  const onCloseToast = useCallback(
    () => {
      setShowToast(false);
    },
    [],
  );

  const { emit: manualEmit } = useManualSocket(sioEvents.promptlib_leave_rooms);
  const {
    isStreaming,
    onStopStreaming
  } = useStopStreaming({
    chatHistoryRef,
    chatHistory,
    setChatHistory,
    manualEmit,
  });

  const onCopyToClipboard = useCallback(
    (id) => async () => {
      const message = chatHistory.find(item => item.id === id);
      if (message) {
        await navigator.clipboard.writeText(message.content);
        setShowToast(true);
        setToastMessage('The message has been copied to the clipboard');
        setToastSeverity('success');
      }
    },
    [chatHistory],
  );

  const onRegenerateAnswerStream = useCallback(id => async () => {
    const questionIndex = chatHistory.findIndex(item => item.id === id) - 1;
    const theQuestion = chatHistory[questionIndex]?.content;
    const leftChatHistory = chatHistory.slice(0, questionIndex);

    const payload = generateChatPayload({
      projectId, prompt_id, context, temperature, max_tokens, top_p, top_k,
      model_name, integration_uid, variables, question: theQuestion, messages,
      chatHistory: leftChatHistory, name, stream: true, currentVersionId
    })
    payload.message_id = id
    emit(payload)
  }, [
    chatHistory,
    context,
    integration_uid,
    max_tokens,
    messages,
    model_name,
    prompt_id,
    temperature,
    top_p,
    variables,
    projectId,
    emit,
    name,
    top_k,
    currentVersionId
  ]);

  const onRegenerateAnswer = useCallback(
    (id) => () => {
      setIsRegenerating(true);
      setAnswerIdToRegenerate(id);
      setChatHistory((prevMessages) => {
        return prevMessages.map(
          message => message.id !== id ?
            message
            :
            ({ ...message, content: 'regenerating...' }));
      });
      chatInput.current?.reset();
      const questionIndex = chatHistory.findIndex(item => item.id === id) - 1;
      const theQuestion = chatHistory[questionIndex]?.content;
      const leftChatHistory = chatHistory.slice(0, questionIndex);

      const payload = generateChatPayload({
        projectId, prompt_id, context, temperature, max_tokens, top_p, top_k,
        model_name, integration_uid, variables, question: theQuestion, messages,
        chatHistory: leftChatHistory, name, stream: false, currentVersionId
      })
      payload.message_id = id
      askAlita(payload);
    },
    [
      askAlita,
      chatHistory,
      context,
      integration_uid,
      max_tokens,
      messages,
      model_name,
      prompt_id,
      temperature,
      top_p,
      variables,
      projectId,
      name,
      top_k,
      currentVersionId
    ],
  );

  useEffect(() => {
    let answer = '';
    if (data?.choices && data?.choices.length && data.choices[0].message) {
      answer = data.choices[0].message.content;
    } else if (data?.messages?.length) {
      answer = data.messages[0].content;
    }
    if (answer) {
      if (!isRegenerating) {
        setChatHistory((prevMessages) => {
          return [...prevMessages, {
            id: new Date().getTime(),
            role: 'assistant',
            content: answer,
          }];
        });
      } else {
        setChatHistory((prevMessages) => {
          return prevMessages.map(
            message => message.id !== answerIdToRegenerate ?
              message
              :
              ({ ...message, content: answer }));
        });
        setAnswerIdToRegenerate('');
        setIsRegenerating(false);
      }
      reset();
    }
  }, [data, data?.choices, data?.messages, isRegenerating, answerIdToRegenerate, prompt_id, reset]);

  useEffect(() => {
    if (error) {
      handleError(error)
      reset();
    }
  }, [error, handleError, reset]);

  const onChangeLLMSettings = useCallback(
    () => {
      
    },
    [],
  )
  

  return (
    <>
      <ChatBoxContainer
        role="presentation"
      >
        <ChatBodyContainer>
          {
            !isNewConversation ?
              <MessageList sx={messageListSX}>
                {
                  chatHistory.map((message, index) => {
                    return message.role === 'user' ?
                      <UserMessage
                        key={message.id}
                        ref={(ref) => (listRefs.current[index] = ref)}
                        content={message.content}
                        onCopy={onCopyToClipboard(message.id)}
                        onDelete={onDeleteAnswer(message.id)}
                      />
                      :
                      <AIAnswer
                        key={message.id}
                        ref={(ref) => (listRefs.current[index] = ref)}
                        answer={message.content}
                        onStop={onStopStreaming(message.id)}
                        onCopy={onCopyToClipboard(message.id)}
                        onDelete={onDeleteAnswer(message.id)}
                        onRegenerate={USE_STREAM ? onRegenerateAnswerStream(message.id) : onRegenerateAnswer(message.id)}
                        shouldDisableRegenerate={isLoading}
                        references={message.references}
                        isLoading={Boolean(message.isLoading)}
                        isStreaming={message.isStreaming}
                      />
                  })
                }
                <div ref={messagesEndRef} />
              </MessageList>
              :
              <NewConversationSettings
                is_public={is_public}
                setIsPublic={setIsPublic}
                selectedChatModel={selectedChatModel}
                setSelectedChatModel={setSelectedChatModel}
                llm_settings={llm_settings}
                onChangeLLMSettings={onChangeLLMSettings}
                selectedChatDatasource={selectedChatDatasource}
                setSelectedChatDatasource={setSelectedChatDatasource}
                selectedChatApplication={selectedChatApplication}
                setSelectedChatApplication={setSelectedChatApplication}
              />
          }
          {
            selectedChatDatasource && <Box sx={{
              width: '100%',
              borderTop: `1px solid ${theme.palette.border.lines}`,
              padding: '8px 16px 8px 16px',
              gap: '12px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>

              <Typography>

              </Typography>
            </Box>
          }
          <ChatInput
            ref={chatInput}
            onSend={USE_STREAM ? onPredictStream : onClickSend}
            isLoading={isLoading || isStreaming}
            disabledSend={isLoading || isStreaming}
            shouldHandleEnter />
        </ChatBodyContainer>
      </ChatBoxContainer>
      <Toast
        open={showToast}
        severity={toastSeverity}
        message={toastMessage}
        onClose={onCloseToast}
      />
      <AlertDialog
        title='Warning'
        alertContent={alertContent}
        open={openAlert}
        onClose={onCloseAlert}
        onCancel={onCloseAlert}
        onConfirm={onConfirmDelete}
      />
    </>
  )
});

ChatBox.displayName = 'ChatBox'

ChatBox.propTypes = {}


export default ChatBox;
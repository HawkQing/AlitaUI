/* eslint-disable react/jsx-no-bind */
import { useAskAlitaMutation } from '@/api/prompts';
import {
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  PUBLIC_PROJECT_ID,
  ROLES,
  sioEvents,
  SocketMessageType,
  StreamingMessageType
} from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import useSocket, { useManualSocket } from "@/hooks/useSocket.jsx";
import { useProjectId } from '@/pages/hooks';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
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
import { useTheme } from '@emotion/react';
import ActiveParticipantBox from './ActiveParticipantBox';
import { generateChatPayload } from '@/components/ChatBox/ChatBox';
import { generateDatasourceChatPayload } from '@/pages/DataSources/Components/Datasources/ChatPanel';

const USE_STREAM = true

const getModelSettings = (participant) => {
  if (participant.type === 'models') {
    const  {
      max_tokens = DEFAULT_MAX_TOKENS,
      top_p = DEFAULT_TOP_P,
      top_k = DEFAULT_TOP_K,
      temperature = DEFAULT_TEMPERATURE,
      integration_uid,
      model_name,
    } = participant;
    return  {
      max_tokens,
      top_p,
      top_k,
      temperature,
      integration_uid,
      model_name,
    }
  } else if (participant.type === 'applications') {
    const  {
      max_tokens = DEFAULT_MAX_TOKENS,
      top_p = DEFAULT_TOP_P,
      top_k = DEFAULT_TOP_K,
      temperature = DEFAULT_TEMPERATURE,
      integration_uid,
      model_name,
    } = participant.llm_settings || {};
    return  {
      max_tokens,
      top_p,
      top_k,
      temperature,
      integration_uid,
      model_name,
    }
  }
  return {}
}

const ChatBox = forwardRef((props, boxRef) => {
  const theme = useTheme();
  const {
    prompt_id,
    context,
    messages,
    variables,
    currentVersionId,
    messageListSX,
    isNewConversation,
    onStartNewConversation,
    activeParticipant,
    onClearActiveParticipant,
    activeConversation,
    setChatHistory
  } = props
  const [conversation, setConversation] = useState({
    name: 'New Conversation',
    is_public: false,
    participant: {
      type: 'models'
    },
    chat_history: [],
  })
  const [askAlita, { isLoading, data, error, reset }] = useAskAlitaMutation();
  const { name, id: userId } = useSelector(state => state.user)
  const chat_history = useMemo(() => activeConversation?.chat_history || [], [activeConversation?.chat_history]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('info')
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [answerIdToRegenerate, setAnswerIdToRegenerate] = useState('');
  const projectId = useProjectId();
  const chatInput = useRef(null);
  const messagesEndRef = useRef();
  const listRefs = useRef([]);
  const activeParticipantRef = useRef();
  const chatHistoryRef = useRef(chat_history);
  const setChatHistoryRef = useRef(setChatHistory);

  const getPayload = useCallback((question, question_id, chatHistory) => {
    const realParticipant = activeParticipant || conversation.participant || {};
    const {
      max_tokens = DEFAULT_MAX_TOKENS,
      top_p = DEFAULT_TOP_P,
      top_k = DEFAULT_TOP_K,
      temperature = DEFAULT_TEMPERATURE,
      integration_uid,
      model_name,
    } = getModelSettings(realParticipant) 
    return realParticipant.type === 'datasources' ? { ...generateDatasourceChatPayload(question, realParticipant.context, chatHistory || chat_history, realParticipant.chatSettings), project_id: PUBLIC_PROJECT_ID, version_id: realParticipant.versionId } :
      generateChatPayload({
        projectId, prompt_id, context, temperature, max_tokens, top_p,
        top_k, model_name, integration_uid, variables, question, messages,
        chatHistory: chatHistory || chat_history, name, stream: true, currentVersionId,
        question_id
      })
  }, [
    conversation.participant,
    activeParticipant,
    chat_history,
    context,
    currentVersionId,
    messages,
    name,
    projectId,
    prompt_id,
    variables])

  useEffect(() => {
    activeParticipantRef.current = activeParticipant;
  }, [activeParticipant]);

  useEffect(() => {
    chatHistoryRef.current = chat_history;
  }, [chat_history]);

  useEffect(() => {
    setChatHistoryRef.current = setChatHistory;
  }, [setChatHistory]);

  useEffect(() => {
    if (!isNewConversation) {
      setConversation({
        name: 'New Conversation',
        is_public: false,
        participant: {
          type: 'models'
        },
        chat_history: [],
      });
    }
  }, [isNewConversation]);

  const {
    openAlert,
    alertContent,
    onDeleteAnswer,
    onDeleteAll,
    onConfirmDelete,
    onCloseAlert
  } = useDeleteMessageAlert({
    setChatHistory: setChatHistoryRef.current,
    chatInput,
  });

  const onClickClearChat = useCallback(() => {
    if (chat_history?.length) {
      onDeleteAll();
    }
  }, [chat_history?.length, onDeleteAll])

  useImperativeHandle(boxRef, () => ({
    onClear: onClickClearChat,
  }));

  useEffect(() => {
    chatHistoryRef.current = chat_history;
  }, [chat_history]);

  const getMessage = useCallback((messageId) => {
    const msgIdx = chatHistoryRef.current?.findIndex(i => i.id === messageId) || -1;
    let msg
    if (msgIdx < 0) {
      msg = {
        id: messageId,
        role: ROLES.Assistant,
        content: '',
        isLoading: false,
        participant: { ...(activeParticipantRef.current || {}) },
        created_at: new Date().getTime(),
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

  const scrollToMessageListEnd = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [])

  const handleSocketEvent = useCallback(async message => {
    const { stream_id, type: socketMessageType, message_type, response_metadata } = message
    const [msgIndex, msg] = getMessage(stream_id, message_type)

    const scrollToMessageBottom = () => {
      if (sessionStorage.getItem(AUTO_SCROLL_KEY) === 'true') {
        const messageElement = listRefs.current[msgIndex]
        if (messageElement) {
          const parentElement = messageElement.parentElement;
          messageElement.scrollIntoView({ block: "end" });
          if (parentElement) {
            parentElement.scrollTop += 12;
          }
        } else {
          scrollToMessageListEnd();
        }
      }
    };

    switch (socketMessageType) {
      case SocketMessageType.StartTask:
        msg.isLoading = true
        msg.isStreaming = false
        msg.content = ''
        msg.references = []
        msgIndex === -1 ? setChatHistoryRef.current(prevState => [...prevState, msg]) : setChatHistoryRef.current(prevState => {
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
        msg.isLoading = false
        msg.isStreaming = true
        setTimeout(scrollToMessageBottom, 0);
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
    msgIndex > -1 && setChatHistoryRef.current(prevState => {
      prevState[msgIndex] = msg
      return [...prevState]
    })
  }, [getMessage, handleError, scrollToMessageListEnd])

  const streamingEvent = useMemo(() =>
    (activeParticipant?.type || conversation.participant.type) === 'datasources'
      ?
      sioEvents.datasource_predict 
      :
      sioEvents.promptlib_predict, [activeParticipant?.type, conversation.participant.type])

  const { emit } = useSocket(streamingEvent, handleSocketEvent)

  const onPredictStream = useCallback(question => {
    if (isNewConversation) {
      onStartNewConversation(conversation);
    }
    setTimeout(scrollToMessageListEnd, 0);
    const question_id = new Date().getTime();
    setChatHistoryRef.current((prevMessages) => {
      return [...prevMessages, {
        id: question_id,
        role: ROLES.User,
        name,
        content: question,
        created_at: new Date().getTime(),
        user_id: userId,
      }]
    })
    const payload = getPayload(question, question_id)
    emit(payload)
  },
    [isNewConversation, scrollToMessageListEnd, getPayload, emit, onStartNewConversation, conversation, name, userId])

  const onClickSend = useCallback(
    async (question) => {
      if (isNewConversation) {
        onStartNewConversation(conversation);
      }
      const question_id = new Date().getTime();
      const payload = getPayload(question, question_id)
      setChatHistoryRef.current((prevMessages) => {
        return [...prevMessages, {
          id: question_id,
          role: 'user',
          name,
          content: question,
        }]
      });
      askAlita(payload);
      setTimeout(scrollToMessageListEnd, 0);
    },
    [isNewConversation, conversation, onStartNewConversation, getPayload, askAlita, scrollToMessageListEnd, name]);


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
    chatHistory: chat_history,
    setChatHistory,
    manualEmit,
  });

  const onCopyToClipboard = useCallback(
    (id) => async () => {
      const message = chat_history.find(item => item.id === id);
      if (message) {
        await navigator.clipboard.writeText(message.content);
        setShowToast(true);
        setToastMessage('The message has been copied to the clipboard');
        setToastSeverity('success');
      }
    },
    [chat_history],
  );

  const onRegenerateAnswerStream = useCallback(id => async () => {
    const questionIndex = chat_history.findIndex(item => item.id === id) - 1;
    const theQuestion = chat_history[questionIndex]?.content;
    const leftChatHistory = chat_history.slice(0, questionIndex);

    const payload = getPayload(theQuestion, id, leftChatHistory)
    payload.message_id = id
    emit(payload)
  }, [chat_history, getPayload, emit]);

  const onRegenerateAnswer = useCallback(
    (id) => () => {
      setIsRegenerating(true);
      setAnswerIdToRegenerate(id);
      setChatHistoryRef.current((prevMessages) => {
        return prevMessages.map(
          message => message.id !== id ?
            message
            :
            ({ ...message, content: 'regenerating...' }));
      });
      chatInput.current?.reset();
      const questionIndex = chat_history.findIndex(item => item.id === id) - 1;
      const theQuestion = chat_history[questionIndex]?.content;
      const leftChatHistory = chat_history.slice(0, questionIndex);

      const payload = getPayload(theQuestion, id, leftChatHistory)
      payload.message_id = id
      askAlita(payload);
    },
    [chat_history, getPayload, askAlita],
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
        setChatHistoryRef.current((prevMessages) => {
          return [...prevMessages, {
            id: new Date().getTime(),
            role: 'assistant',
            content: answer,
          }];
        });
      } else {
        setChatHistoryRef.current((prevMessages) => {
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


  return (
    <>
      <ChatBoxContainer
        role="presentation"
      >
        <ChatBodyContainer
          sx={{
            [theme.breakpoints.up('lg')]: {
              height: 'calc(100vh - 160px)',
            },
            [theme.breakpoints.down('lg')]: {
              height: '500px',
            }
          }}
        >
          {
            !isNewConversation ?
              <MessageList sx={messageListSX}>
                {
                  chat_history.map((message, index) => {
                    return message.role === 'user' ?
                      <UserMessage
                        key={message.id}
                        verticalMode
                        ref={(ref) => (listRefs.current[index] = ref)}
                        content={message.content}
                        created_at={message.created_at}
                        onCopy={onCopyToClipboard(message.id)}
                        onDelete={onDeleteAnswer(message.id)}
                      />
                      :
                      <AIAnswer
                        key={message.id}
                        verticalMode
                        ref={(ref) => (listRefs.current[index] = ref)}
                        answer={message.content}
                        created_at={message.created_at}
                        participant={message.participant}
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
                conversation={conversation}
                onChangeConversation={setConversation}
              />
          }
          {
            !isNewConversation && activeConversation.id &&
            <ActiveParticipantBox
              activeParticipant={activeParticipant}
              onClearActiveParticipant={onClearActiveParticipant}
            />
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
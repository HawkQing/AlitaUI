/* eslint-disable react/jsx-no-bind */
import { useAskAlitaMutation } from '@/api/prompts';
import {
  ChatBoxMode,
  ChatParticipantType,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TEMPERATURE,
  DEFAULT_TOP_K,
  DEFAULT_TOP_P,
  ROLES,
  ToolActionStatus
} from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import { useSelectedProjectId } from '@/pages/hooks';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ChatInput from '@/components/ChatBox/ChatInput';
import Toast from '@/components/Toast.jsx';
import { useChatSocket, useStopStreaming } from '@/components/ChatBox/hooks';
import { ChatBodyContainer, ChatBoxContainer, MessageList } from '@/components/ChatBox/StyledComponents';
import AlertDialog from '@/components/AlertDialog';
import UserMessage from '@/components/ChatBox/UserMessage';
import AIAnswer from '@/components/ChatBox/AIAnswer';
import useDeleteMessageAlert from '@/components/ChatBox/useDeleteMessageAlert';
import NewConversationSettings from './NewConversationSettings';
import { useTheme } from '@emotion/react';
import ActiveParticipantBox from './ActiveParticipantBox';
import { generateApplicationStreamingPayload, generateChatPayload } from '@/components/ChatBox/ChatBox';
import { generateDatasourceChatPayload } from '@/pages/DataSources/Components/Datasources/ChatPanel';
import useInputKeyDownHandler from './useInputKeyDownHandler';
import SuggestedParticipants from './SuggestedParticipants';
import ChatBoxHeader from './ChatBoxHeader';
import ApplicationAnswer from '@/components/ChatBox/ApplicationAnswer';
import { v4 as uuidv4 } from 'uuid';

const USE_STREAM = true

const getModelSettings = (participant) => {
  if (participant.type === ChatParticipantType.Prompts) {
    const {
      max_tokens = DEFAULT_MAX_TOKENS,
      top_p = DEFAULT_TOP_P,
      top_k = DEFAULT_TOP_K,
      temperature = DEFAULT_TEMPERATURE,
      model = {}
    } = participant.version_details.model_settings
    const { integration_uid, model_name, } = model
    return {
      max_tokens,
      top_p,
      top_k,
      temperature,
      integration_uid,
      model_name,
    }
  } else if (participant.type === ChatParticipantType.Models) {
    const {
      max_tokens = DEFAULT_MAX_TOKENS,
      top_p = DEFAULT_TOP_P,
      top_k = DEFAULT_TOP_K,
      temperature = DEFAULT_TEMPERATURE,
      integration_uid,
      model_name,
    } = participant;
    return {
      max_tokens,
      top_p,
      top_k,
      temperature,
      integration_uid,
      model_name,
    }
  } else if (participant.type === ChatParticipantType.Applications) {
    const {
      max_tokens = DEFAULT_MAX_TOKENS,
      top_p = DEFAULT_TOP_P,
      top_k = DEFAULT_TOP_K,
      temperature = DEFAULT_TEMPERATURE,
      integration_uid,
      model_name,
    } = participant.version_details.llm_settings || {};
    return {
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
    messageListSX,
    isCreatingConversation,
    onChangeConversation,
    activeParticipant,
    onClearActiveParticipant,
    activeConversation,
    setChatHistory,
    onSelectActiveParticipant,
    setIsStreaming,
    onCreateConversation,
  } = props
  const projectId = useSelectedProjectId();
  const [askAlita, { isLoading, data, error, reset }] = useAskAlitaMutation();
  const { name, id: userId } = useSelector(state => state.user)
  const chat_history = useMemo(() => activeConversation?.chat_history || [], [activeConversation?.chat_history]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('info')
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [answerIdToRegenerate, setAnswerIdToRegenerate] = useState('');
  const chatInput = useRef(null);
  const listRefs = useRef([]);
  const suggestedParticipantsRef = useRef();

  const getPayload = useCallback((question, question_id, chatHistory, participant) => {
    const realParticipant = participant || activeParticipant || {};
    const {
      max_tokens = DEFAULT_MAX_TOKENS,
      top_p = DEFAULT_TOP_P,
      top_k = DEFAULT_TOP_K,
      temperature = DEFAULT_TEMPERATURE,
      integration_uid,
      model_name,
    } = getModelSettings(realParticipant)
    switch (realParticipant.type) {
      case ChatParticipantType.Datasources:
        return {
          ...generateDatasourceChatPayload(question,
            realParticipant.version_details?.context,
            chatHistory || chat_history,
            realParticipant.version_details?.datasource_settings?.chat,
          ),
          project_id: projectId,
          version_id: realParticipant.version_details?.id,
          question_id
        }
      case ChatParticipantType.Prompts:
        return generateChatPayload({
          projectId, prompt_id: realParticipant.id, context: realParticipant.version_details.context, temperature, max_tokens, top_p,
          top_k, model_name, integration_uid, variables: realParticipant.version_details.variables, question,
          chatHistory: chatHistory || chat_history, name, stream: true, currentVersionId: realParticipant.version_id,
          question_id
        })
      case ChatParticipantType.Applications:
        return generateApplicationStreamingPayload({
          projectId, application_id: activeParticipant?.id,
          instructions: activeParticipant?.version_details.instructions, temperature,
          max_tokens, top_p, top_k, model_name, integration_uid,
          variables: activeParticipant?.version_details.variables,
          question, tools: activeParticipant?.version_details.tools, name,
          currentVersionId: activeParticipant?.version_details.id,
          question_id,
        })
      default:
        return generateChatPayload({
          projectId, prompt_id: undefined, context: undefined, temperature, max_tokens, top_p,
          top_k, model_name, integration_uid, variables: undefined, question, messages: undefined,
          chatHistory: chatHistory || chat_history, name, stream: true, currentVersionId: undefined,
          question_id
        })
    }
  }, [
    activeParticipant,
    chat_history,
    name,
    projectId,
  ])

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

  const {
    chatHistoryRef,
    scrollToMessageListEnd,
    emit,
    manualEmit,
    messagesEndRef,
  } = useChatSocket({
    mode: ChatBoxMode.Chat,
    handleError,
    listRefs,
    isApplicationChat: false,
    chatHistory: chat_history,
    setChatHistory,
    activeParticipant,
  })

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
    if (chat_history?.length) {
      onDeleteAll();
    }
  }, [chat_history?.length, onDeleteAll])

  useImperativeHandle(boxRef, () => ({
    onClear: onClickClearChat,
  }));


  const onPredictStream = useCallback(question => {
    if (isCreatingConversation) {
      onCreateConversation();
    }
    setTimeout(scrollToMessageListEnd, 0);
    const question_id = uuidv4();
    setChatHistory((prevMessages) => {
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
    [isCreatingConversation, scrollToMessageListEnd, setChatHistory, getPayload, emit, onCreateConversation, name, userId])

  const onClickSend = useCallback(
    async (question) => {
      if (isCreatingConversation) {
        onCreateConversation();
      }
      const question_id = uuidv4();
      const payload = getPayload(question, question_id)
      setChatHistory((prevMessages) => {
        return [...prevMessages, {
          id: question_id,
          role: ROLES.User,
          name,
          participant: activeParticipant,
          content: question,
          created_at: new Date().getTime(),
          user_id: userId,
        }]
      });
      askAlita(payload);
      setTimeout(scrollToMessageListEnd, 0);
    },
    [
      isCreatingConversation,
      getPayload,
      setChatHistory,
      askAlita,
      scrollToMessageListEnd,
      onCreateConversation,
      name,
      userId,
      activeParticipant]);


  const onCloseToast = useCallback(
    () => {
      setShowToast(false);
    },
    [],
  );

  const {
    isStreaming,
    onStopStreaming,
    onStopAll,
  } = useStopStreaming({
    chatHistoryRef,
    chatHistory: chat_history,
    setChatHistory,
    manualEmit,
  });

  useEffect(() => {
    setIsStreaming(isStreaming)
  }, [isStreaming, setIsStreaming])

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
    payload.stream_id = id
    emit(payload)
  }, [chat_history, getPayload, emit]);

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
      const questionIndex = chat_history.findIndex(item => item.id === id) - 1;
      const theQuestion = chat_history[questionIndex]?.content;
      const leftChatHistory = chat_history.slice(0, questionIndex);

      const payload = getPayload(theQuestion, id, leftChatHistory)
      payload.message_id = id
      payload.stream_id = id
      askAlita(payload);
    },
    [setChatHistory, chat_history, getPayload, askAlita],
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
            id: uuidv4(),
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
  }, [data, data?.choices, data?.messages, isRegenerating, answerIdToRegenerate, reset, setChatHistory]);

  useEffect(() => {
    if (error) {
      handleError(error)
      reset();
    }
  }, [error, handleError, reset]);

  const {
    onKeyDown,
    participantType,
    suggestions,
    noSearchResult,
    isProcessingSymbols,
    query,
    stopProcessingSymbols
  } = useInputKeyDownHandler(activeConversation?.participants)

  const onSelectParticipant = useCallback(
    (participant) => {
      stopProcessingSymbols();
      onSelectActiveParticipant(participant);
      setTimeout(() => {
        const symbol = query.charAt(0);
        chatInput.current?.replaceSymbolWithParticipantName(symbol, participant.name || participant.model_name);
      }, 0);
    },
    [onSelectActiveParticipant, query, stopProcessingSymbols],
  )

  const onEnterDownHandler = useCallback(
    () => {
      if (isProcessingSymbols) {
        suggestedParticipantsRef.current?.selectParticipant()
      } else {
        chatInput.current?.sendQuestion();
      }
    },
    [isProcessingSymbols],
  )

  const onSubmitEditedMessage = useCallback(
    (id, participant, question) => {
      const questionIndex = chat_history.findIndex(item => item.id === id);
      const leftChatHistory = chat_history.slice(0, questionIndex);
      const payload = getPayload(question, id, leftChatHistory, participant)
      payload.message_id = chat_history[questionIndex + 1]?.id
      setChatHistory(prev => prev.map(item => item.id === id ? ({ ...item, content: question }) : item))
      USE_STREAM ? emit(payload) : askAlita(payload);

    },
    [askAlita, chat_history, emit, getPayload, setChatHistory,],
  )

  useEffect(() => {
    if (isCreatingConversation && chatInput.current) {
      chatInput.current.reset();
    }
  }, [isCreatingConversation])

  return (
    <>
      <ChatBoxHeader
        isStreaming={isStreaming}
        onClear={onClickClearChat}
        conversationName={activeConversation?.name}
        onStopStreaming={onStopAll}
      />
      <ChatBoxContainer
        role="presentation"
        sx={{ paddingBottom: '0px' }}
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
            !isCreatingConversation ?
              <MessageList sx={messageListSX}>
                {
                  chat_history.map((message, index) => {
                    return message.role === 'user' ?
                      <UserMessage
                        key={message.id}
                        messageId={message.id}
                        verticalMode
                        ref={(ref) => (listRefs.current[index] = ref)}
                        content={message.content}
                        created_at={message.created_at}
                        participant={message.participant}
                        onCopy={onCopyToClipboard(message.id)}
                        onDelete={onDeleteAnswer(message.id)}
                        onSubmit={onSubmitEditedMessage}
                      />
                      :
                      message.participant?.type !== ChatParticipantType.Applications ?
                        <AIAnswer
                          key={message.id}
                          verticalMode
                          ref={(ref) => (listRefs.current[index] = ref)}
                          answer={message.content}
                          created_at={message.created_at}
                          participant={message.participant}
                          hasBeenStopped={message.hasBeenStopped}
                          onStop={onStopStreaming(message)}
                          onCopy={onCopyToClipboard(message.id)}
                          onDelete={onDeleteAnswer(message.id)}
                          onRegenerate={
                            chat_history.length - 1 === index ?
                              USE_STREAM ? onRegenerateAnswerStream(message.id) : onRegenerateAnswer(message.id)
                              :
                              undefined}
                          shouldDisableRegenerate={isLoading || isStreaming || Boolean(message.isLoading)}
                          references={message.references}
                          isLoading={Boolean(message.isLoading)}
                          isStreaming={message.isStreaming}
                        />
                        :
                        <ApplicationAnswer
                          key={message.id}
                          verticalMode
                          ref={(ref) => (listRefs.current[index] = ref)}
                          answer={message.content}
                          hasBeenStopped={message.hasBeenStopped}
                          onStop={onStopStreaming(message)}
                          onCopy={onCopyToClipboard(message.id)}
                          onDelete={onDeleteAnswer(message.id)}
                          participant={message.participant}
                          onRegenerate={
                            chat_history.length - 1 === index ?
                              USE_STREAM ? onRegenerateAnswerStream(message.id) : onRegenerateAnswer(message.id)
                              :
                              undefined}
                          shouldDisableRegenerate={isLoading || isStreaming || Boolean(message.isLoading)}
                          references={message.references}
                          exception={message.exception}
                          toolActions={message.toolActions || [
                            { id: 1, name: 'Tool action 1', content: 'action content', status: ToolActionStatus.complete },
                            { id: 2, name: 'Tool action 2', content: 'action content', status: ToolActionStatus.error },
                            { id: 3, name: 'Tool action 3', content: 'Some description about the action', status: ToolActionStatus.actionRequired, query: '{"query": "2 + 3 = ?"}' },
                            { id: 4, name: 'Tool action 4', content: 'action content', status: ToolActionStatus.processing },
                            { id: 5, name: 'Tool action 5', content: 'action content', status: ToolActionStatus.cancelled },
                          ]}
                          isLoading={Boolean(message.isLoading)}
                          isStreaming={message.isStreaming}
                          created_at={message.created_at}
                        />
                  })
                }
                <div ref={messagesEndRef} />
              </MessageList>
              :
              activeConversation ?
                <NewConversationSettings
                  conversation={activeConversation}
                  onChangeConversation={onChangeConversation}
                />
                : null
          }
          {
            !isCreatingConversation && activeConversation?.id && !isProcessingSymbols &&
            <ActiveParticipantBox
              activeParticipant={activeParticipant}
              onClearActiveParticipant={onClearActiveParticipant}
            />
          }
          {
            !isCreatingConversation && isProcessingSymbols &&
            <SuggestedParticipants
              ref={suggestedParticipantsRef}
              participants={suggestions || []}
              participantType={participantType}
              noSearchResult={noSearchResult}
              onSelectParticipant={onSelectParticipant}
            />
          }
          <ChatInput
            ref={chatInput}
            onSend={USE_STREAM ? onPredictStream : onClickSend}
            isLoading={isLoading || isStreaming}
            disabledSend={isLoading || isStreaming || isProcessingSymbols || (!activeConversation?.id && !isCreatingConversation)}
            onNormalKeyDown={onKeyDown}
            onEnterDownHandler={onEnterDownHandler}
            disabledInput={!activeConversation?.id && !isCreatingConversation}
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
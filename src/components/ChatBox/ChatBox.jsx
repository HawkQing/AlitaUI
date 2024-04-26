/* eslint-disable react/jsx-no-bind */
import { useAskAlitaMutation } from '@/api/prompts';
import {
  ChatBoxMode,
  DEFAULT_MAX_TOKENS,
  DEFAULT_TOP_P,
  PROMPT_PAYLOAD_KEY,
  ROLES,
  ToolActionStatus
} from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import { ConversationStartersView } from '@/pages/Applications/Components/Applications/ConversationStarters';
import { useProjectId } from '@/pages/hooks';
import { actions } from '@/slices/prompts';
import { Box } from '@mui/material';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AlertDialog from '../AlertDialog';
import GroupedButton from '../GroupedButton';
import ClearIcon from '../Icons/ClearIcon';
import Toast from '../Toast';
import AIAnswer from './AIAnswer';
import ActionButtons from './ActionButtons';
import ChatInput from './ChatInput';
import {
  ActionButton,
  ActionContainer,
  ChatBodyContainer,
  ChatBoxContainer,
  MessageList,
  RunButton,
  SendButtonContainer,
  StyledCircleProgress
} from './StyledComponents';
import UserMessage from './UserMessage';
import useDeleteMessageAlert from './useDeleteMessageAlert';
import { useChatSocket, useStopStreaming } from './hooks';
import ApplicationAnswer from './ApplicationAnswer';
import { usePredictMutation as useApplicationPredictMutation } from '@/api/applications';

const USE_STREAM = true

export const generatePayload = ({
  projectId, prompt_id, context, temperature,
  max_tokens, top_p, top_k, model_name, integration_uid,
  variables, messages, type, name, stream = true, currentVersionId, question_id
}) => ({
  prompt_id,
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
      integration_uid,
    }
  },
  variables: variables ? variables.map((item) => {
    const { key, name: variableName, value } = item;
    return {
      name: variableName || key,
      value,
    }
  }) : [],
  messages,
  format_response: true,
  question_id,
})

export const generateChatPayload = ({
  projectId, prompt_id, context, temperature,
  max_tokens, top_p, top_k, model_name, integration_uid,
  variables, question, messages, chatHistory, name, stream = true,
  currentVersionId,
  question_id
}) => {
  const payload = generatePayload({
    projectId, prompt_id, context, temperature,
    max_tokens, top_p, top_k, model_name, integration_uid,
    variables, messages, type: 'chat', name, stream, currentVersionId, question_id
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

export const generateApplicationPayload = ({
  projectId, application_id, instructions, temperature,
  max_tokens, top_p, top_k, model_name, integration_uid,
  variables, tools, name, currentVersionId, question_id
}) => ({
  application_id,
  user_name: name,
  project_id: projectId,
  version_id: currentVersionId,
  instructions,
  llm_settings: {
    temperature,
    max_tokens,
    top_p,
    top_k,
    model_name,
    integration_uid,
  },
  variables: variables ? variables.map((item) => {
    const { key, name: variableName, value } = item;
    return {
      name: variableName || key,
      value,
    }
  }) : [],
  tools,
  question_id,
})

export const generateApplicationStreamingPayload = ({
  projectId, application_id, instructions, temperature,
  max_tokens, top_p, top_k, model_name, integration_uid,
  variables, question, tools, chatHistory, name,
  currentVersionId,
  question_id
}) => {
  const payload = generateApplicationPayload({
    projectId, application_id, instructions, temperature,
    max_tokens, top_p, top_k, model_name, integration_uid,
    variables, tools, name, currentVersionId, question_id
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
  const {
    prompt_id,
    integration_uid,
    model_name,
    temperature,
    context,
    messages,
    max_tokens = DEFAULT_MAX_TOKENS,
    top_p = DEFAULT_TOP_P,
    top_k,
    variables,
    type,
    chatOnly = false,
    currentVersionId,
    conversationStarters = [],
    isFullScreenChat,
    setIsFullScreenChat,
    messageListSX,
    isApplicationChat,
    application_id,
    instructions,
    tools,
  } = props
  const dispatch = useDispatch();
  const [askAlita, { isLoading, data, error, reset }] = useAskAlitaMutation();
  const [applicationPredict,] = useApplicationPredictMutation();
  const { name } = useSelector(state => state.user)
  const [mode, setMode] = useState(type);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('info')
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [answerIdToRegenerate, setAnswerIdToRegenerate] = useState('');
  const projectId = useProjectId();
  const chatInput = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const listRefs = useRef([]);

  const handleError = useCallback(
    (errorObj) => {
      setIsRunning(false);
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
    chatHistory,
    chatHistoryRef,
    setChatHistory,
    scrollToMessageListEnd,
    emit,
    manualEmit,
    completionResult,
    setCompletionResult,
    messagesEndRef,
  } = useChatSocket({
    mode,
    handleError,
    setIsRunning,
    listRefs,
    isApplicationChat,
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
    if (chatHistory.length) {
      onDeleteAll();
    }
  }, [chatHistory.length, onDeleteAll])

  useImperativeHandle(boxRef, () => ({
    onClear: onClickClearChat,
  }));

  const onSelectChatMode = useCallback(
    (e) => {
      const chatMode = e?.target?.value;
      if (mode !== chatMode) {
        setMode(chatMode);
        chatInput.current?.reset();
        dispatch(actions.updateCurrentPromptData({
          key: PROMPT_PAYLOAD_KEY.type,
          data: chatMode
        }));
      }
    },
    [dispatch, mode],
  );

  const onPredictStream = useCallback(question => {
    setTimeout(scrollToMessageListEnd, 0);
    setChatHistory((prevMessages) => {
      return [...prevMessages, {
        id: new Date().getTime(),
        role: ROLES.User,
        name,
        content: question,
      }]
    })
    const payload = !isApplicationChat ? generateChatPayload({
      projectId, prompt_id, context, temperature, max_tokens, top_p,
      top_k, model_name, integration_uid, variables, question, messages,
      chatHistory, name, stream: true, currentVersionId
    }) : generateApplicationStreamingPayload({
      projectId, application_id, instructions, temperature,
      max_tokens, top_p, top_k, model_name, integration_uid,
      variables, question, tools, name, currentVersionId,
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
      scrollToMessageListEnd,
      tools,
      instructions,
      application_id,
      isApplicationChat
    ])

  const onClickSend = useCallback(
    async (question) => {
      const payload = !isApplicationChat ? generateChatPayload({
        projectId, prompt_id, context, temperature, max_tokens,
        top_p, top_k, model_name, integration_uid, variables,
        question, messages, chatHistory, name, stream: false,
        currentVersionId
      }) : generateApplicationPayload({
        projectId, application_id, instructions, temperature,
        max_tokens, top_p, top_k, model_name, integration_uid,
        variables, tools, name, currentVersionId
      })
      setChatHistory((prevMessages) => {
        return [...prevMessages, {
          id: new Date().getTime(),
          role: 'user',
          name,
          content: question,
        }]
      });
      !isApplicationChat ? askAlita(payload) : applicationPredict(payload);
      setTimeout(scrollToMessageListEnd, 0);
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
      scrollToMessageListEnd,
      setChatHistory,
      isApplicationChat,
      application_id,
      tools,
      instructions,
      applicationPredict,
    ]);
  const onClickRun = useCallback(() => {
    setCompletionResult([{
      id: new Date().getTime(),
      role: ROLES.Assistant,
      isLoading: false,
      content: '',
    }]);
    const payload = generatePayload({
      projectId, prompt_id, context, temperature, max_tokens, top_p, top_k,
      model_name, integration_uid, variables, messages, type: 'freeform', name,
      stream: false, currentVersionId
    })
    askAlita(payload);
  },
    [
      askAlita,
      messages,
      context,
      integration_uid,
      max_tokens,
      model_name,
      prompt_id,
      temperature,
      top_p,
      variables,
      projectId,
      name,
      top_k,
      currentVersionId,
      setCompletionResult
    ]);

  const onClickRunStream = useCallback(() => {
    setIsRunning(true);
    const payload = generatePayload({
      projectId, prompt_id, context, temperature, max_tokens, top_p, top_k,
      model_name, integration_uid, variables, messages, type: 'freeform', name,
      stream: true, currentVersionId
    })
    emit(payload)
  },
    [
      messages,
      context,
      integration_uid,
      max_tokens,
      model_name,
      prompt_id,
      temperature,
      top_p,
      variables,
      projectId,
      name,
      emit,
      top_k,
      currentVersionId
    ]);

  const onCloseToast = useCallback(
    () => {
      setShowToast(false);
    },
    [],
  );

  const onCopyToMessages = useCallback(
    (id, role) => () => {
      const message = chatHistory.find(item => item.id === id);
      if (message) {
        dispatch(actions.updateCurrentPromptData({
          key: PROMPT_PAYLOAD_KEY.messages,
          data: [
            ...messages,
            {
              role,
              content: message.content,
              id: new Date().getTime() + '',
            }]
        }));
        setShowToast(true);
        setToastMessage('The message has been appended to the Messages');
        setToastSeverity('success');
      }
    },
    [chatHistory, dispatch, messages],
  );

  const {
    isStreaming,
    onStopAll,
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

  const onCopyCompletion = useCallback(async () => {
    await navigator.clipboard.writeText(completionResult[0].content);
    setShowToast(true);
    setToastMessage('The message has been copied to the clipboard');
    setToastSeverity('success');
  }, [completionResult])

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
      currentVersionId,
      setChatHistory
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
      if (mode === ChatBoxMode.Chat) {
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
      } else {
        setIsRunning(false);
        setCompletionResult(
          [{
            id: new Date().getTime(),
            role: ROLES.Assistant,
            isLoading: false,
            content: answer,
          }]
        )
      }
      reset();
    }
  }, [data, data?.choices, data?.messages, isRegenerating, mode, answerIdToRegenerate, prompt_id, setCompletionResult, setChatHistory, reset]);

  useEffect(() => {
    if (error) {
      handleError(error)
      reset();
    }
  }, [error, handleError, reset]);

  useEffect(() => {
    if (!mode && type) {
      setMode(type);
    }
  }, [mode, type]);

  const buttonItems = useMemo(() =>
    Object.entries(ChatBoxMode).map(
      ([label, value]) => ({ label, value })
    ), []);

  return (
    <>
      <ChatBoxContainer
        role="presentation"
      >
        {!chatOnly && <ActionContainer>
          <GroupedButton
            value={mode}
            onChange={onSelectChatMode}
            buttonItems={buttonItems}
          />
          <Box display='flex' gap='8px'>
            <ActionButtons
              isFullScreenChat={isFullScreenChat}
              setIsFullScreenChat={setIsFullScreenChat}
              isStreaming={isStreaming}
              onStopAll={onStopAll}
            />
            {
              mode === ChatBoxMode.Chat ?
                <ActionButton
                  aria-label="clear the chat"
                  disabled={isLoading || isStreaming || !chatHistory.length}
                  onClick={onClickClearChat}
                  sx={{ height: '28px', width: '28px' }}
                >
                  <ClearIcon sx={{ fontSize: 16 }} />
                </ActionButton>
                :
                <SendButtonContainer>
                  <RunButton disabled={isLoading || isRunning || !model_name}
                    onClick={USE_STREAM ? onClickRunStream : onClickRun}
                  >
                    Run
                  </RunButton>
                  {(isLoading || isRunning) && <StyledCircleProgress size={20} />}
                </SendButtonContainer>
            }
          </Box>
        </ActionContainer>}
        <ChatBodyContainer>
          <MessageList sx={messageListSX}>
            {
              mode === ChatBoxMode.Chat ?
                (chatHistory?.length > 0 ? chatHistory.map((message, index) => {
                  if (!message.created_at) {
                    message.created_at = new Date()
                  }
                  return message.role === 'user' ?
                    <UserMessage
                      key={message.id}
                      ref={(ref) => (listRefs.current[index] = ref)}
                      content={message.content}
                      onCopy={onCopyToClipboard(message.id)}
                      onCopyToMessages={onCopyToMessages(message.id, ROLES.User)}
                      onDelete={onDeleteAnswer(message.id)}
                      created_at={message.created_at}
                    />
                    :
                    !isApplicationChat ? <AIAnswer
                      key={message.id}
                      ref={(ref) => (listRefs.current[index] = ref)}
                      answer={message.content}
                      onStop={onStopStreaming(message.id)}
                      onCopy={onCopyToClipboard(message.id)}
                      onCopyToMessages={onCopyToMessages(message.id, ROLES.Assistant)}
                      onDelete={onDeleteAnswer(message.id)}
                      onRegenerate={USE_STREAM ? onRegenerateAnswerStream(message.id) : onRegenerateAnswer(message.id)}
                      shouldDisableRegenerate={isLoading || isStreaming}
                      references={message.references}
                      isLoading={Boolean(message.isLoading)}
                      isStreaming={message.isStreaming}
                      created_at={message.created_at}
                    /> :
                      <ApplicationAnswer
                        key={message.id}
                        ref={(ref) => (listRefs.current[index] = ref)}
                        answer={message.content}
                        onStop={onStopStreaming(message.id)}
                        onCopy={onCopyToClipboard(message.id)}
                        onDelete={onDeleteAnswer(message.id)}
                        onRegenerate={USE_STREAM ? onRegenerateAnswerStream(message.id) : onRegenerateAnswer(message.id)}
                        shouldDisableRegenerate={isLoading || isStreaming}
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
                }) :
                  <ConversationStartersView items={conversationStarters} onSend={USE_STREAM ? onPredictStream : onClickSend} />
                ) :
                (completionResult[0].isLoading || completionResult[0].content) &&
                <AIAnswer
                  answer={completionResult[0].content}
                  onCopy={onCopyCompletion}
                  references={completionResult[0].references}
                  isLoading={Boolean(completionResult[0].isLoading)}
                />
            }
            <div ref={messagesEndRef} />
          </MessageList>
          {
            mode === ChatBoxMode.Chat &&
            <ChatInput
              ref={chatInput}
              onSend={USE_STREAM ? onPredictStream : onClickSend}
              isLoading={isLoading || isStreaming}
              disabledSend={isLoading || !model_name || isStreaming}
              shouldHandleEnter />
          }
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
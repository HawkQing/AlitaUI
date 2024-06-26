/* eslint-disable react/jsx-no-bind */
import { ChatParticipantType, ROLES, sioEvents, SocketMessageType } from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import AlertDialog from '@/components/AlertDialog';
import AIAnswer from '@/components/ChatBox/AIAnswer';
import ActionButtons from '@/components/ChatBox/ActionButtons';
import { AUTO_SCROLL_KEY } from '@/components/ChatBox/AutoScrollToggle';
import ChatInput from '@/components/ChatBox/ChatInput';
import {
  ActionButton,
  ChatBodyContainer,
  ChatBoxContainer,
  MessageList
} from '@/components/ChatBox/StyledComponents';
import UserMessage from '@/components/ChatBox/UserMessage';
import { useStopStreaming } from '@/components/ChatBox/hooks';
import useDeleteMessageAlert from '@/components/ChatBox/useDeleteMessageAlert';
import ClearIcon from '@/components/Icons/ClearIcon';
import SettingIcon from '@/components/Icons/SettingIcon';
import Toast from '@/components/Toast';
import useSocket, { useManualSocket } from "@/hooks/useSocket.jsx";
import { useIsSmallWindow, useProjectId } from '@/pages/hooks';
import { Box } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import AdvancedChatSettings from './AdvancedChatSettings';
import ChatSettings from './ChatSettings';
import { v4 as uuidv4 } from 'uuid';

const MESSAGE_REFERENCE_ROLE = 'reference'
export const generateDatasourceChatPayload = (question, context, chatHistory, chatSettings, question_id) => {
  return {
    input: question,
    context: context,
    chat_history: chatHistory.filter(i => i.role !== MESSAGE_REFERENCE_ROLE),

    chat_settings_ai: chatSettings.chat_settings_ai,

    chat_settings_embedding: chatSettings.chat_settings_embedding,
    question_id
  }
}

const ChatPanel = ({
  onClickAdvancedSettings,
  showAdvancedSettings,
  onCloseAdvancedSettings,
  chatSettings,
  onChangeChatSettings,
  versionId,
  context,
  chatHistory,
  setChatHistory,
  isFullScreenChat,
  setIsFullScreenChat
}) => {
  const { name } = useSelector(state => state.user)
  const currentProjectId = useProjectId();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('info')

  const chatInput = useRef(null);
  const { isSmallWindow } = useIsSmallWindow();
  const messagesEndRef = useRef();
  const listRefs = useRef([]);
  const chatHistoryRef = useRef(chatHistory);

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

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  const getMessage = useCallback((messageId) => {
    const msgIdx = chatHistoryRef.current.findIndex(i => i.id === messageId)
    let msg
    if (msgIdx < 0) {
      msg = {
        id: messageId,
        role: ROLES.Assistant,
        content: '',
        isLoading: false,
        participant: { type: ChatParticipantType.Datasources }
      }
    } else {
      msg = chatHistoryRef.current[msgIdx]
    }
    return [msgIdx, msg]
  }, [])


  const scrollToMessageListEnd = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [])

  const handleSocketEvent = useCallback(async message => {
    const { stream_id, message_id, type, response_metadata } = message
    const { task_id } = message.content instanceof Object ? message.content : {}

    const [msgIndex, msg] = getMessage(stream_id || message_id)

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

    switch (type) {
      case SocketMessageType.StartTask:
        msg.content = ''
        msg.isLoading = true
        msg.isStreaming = true
        msg.references = []
        msg.task_id = task_id
        break
      case SocketMessageType.Chunk:
        msg.content += message.content
        msg.isLoading = false
        setTimeout(scrollToMessageBottom, 0);
        if (response_metadata?.finish_reason) {
          msg.isStreaming = false
        }
        break
      case SocketMessageType.References:
        msg.references = message.references
        msg.isLoading = false
        setTimeout(scrollToMessageBottom, 0);
        break
      case SocketMessageType.Error:
        setShowToast(true);
        setToastMessage(buildErrorMessage({ data: message.content || [] }));
        setToastSeverity('error');
        msg.isStreaming = false
        return
      default:
        // eslint-disable-next-line no-console
        console.warn('unknown message type', type)
        return
    }
    if (msgIndex < 0) {
      setChatHistory(prevState => [...prevState, msg])
      setTimeout(scrollToMessageBottom, 0);
    } else {
      setChatHistory(prevState => {
        prevState[msgIndex] = msg
        return [...prevState]
      })
    }
  }, [getMessage, setChatHistory, scrollToMessageListEnd])

  const { emit } = useSocket(sioEvents.datasource_predict, handleSocketEvent)

  const onCloseToast = useCallback(
    () => {
      setShowToast(false);
    },
    [],
  );

  const { emit: manualEmit } = useManualSocket(sioEvents.datasource_leave_rooms);
  const {
    isStreaming,
    onStopAll,
    onStopStreaming,
    isStopError,
    stopError
  } = useStopStreaming({
    chatHistoryRef,
    chatHistory,
    setChatHistory,
    manualEmit
  });

  useEffect(() => {
    if (isStopError) {
      setToastMessage(buildErrorMessage(stopError));
      setToastSeverity('error');
      setShowToast(true);
    }
  }, [isStopError, stopError])

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

  const onPredict = useCallback(async question => {
    setTimeout(scrollToMessageListEnd, 0);
    setChatHistory((prevMessages) => {
      return [...prevMessages, {
        id: uuidv4(),
        role: ROLES.User,
        name,
        content: question,
      }]
    })
    const payload = generateDatasourceChatPayload(question, context, chatHistory, chatSettings)
    emit({ ...payload, project_id: currentProjectId, version_id: versionId })
  }, [
    chatHistory,
    setChatHistory,
    context,
    chatSettings,
    name,
    currentProjectId,
    versionId,
    emit,
    scrollToMessageListEnd,
  ])

  const onRegenerateAnswer = useCallback(id => async () => {
    chatInput.current?.reset();
    const questionIndex = chatHistory.findIndex(item => item.id === id) - 1;
    const theQuestion = chatHistory[questionIndex].content;
    const leftChatHistory = chatHistory.slice(0, questionIndex);
    const payload = generateDatasourceChatPayload(theQuestion, context, leftChatHistory, chatSettings)
    setChatHistory((prevMessages) => {
      return prevMessages.map(
        message => message.id !== id ?
          message
          :
          ({ ...message, content: '', task_id: undefined }));
    });
    emit({ ...payload, project_id: currentProjectId, version_id: versionId, message_id: id })
  }, [
    chatHistory,
    setChatHistory,
    context,
    chatSettings,
    currentProjectId,
    versionId,
    emit,
  ]);

  return (
    <>
      <Box position={'relative'} display={'flex'} flexDirection={'column'} flexGrow={1}>
        <Box sx={{
          position: 'absolute',
          top: '-12px',
          transform: 'translateY(-100%)',
          right: '0px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          gap: '8px'
        }}
        >
          <ActionButtons
            isFullScreenChat={isFullScreenChat}
            setIsFullScreenChat={setIsFullScreenChat}
            isStreaming={isStreaming}
            onStopAll={onStopAll}
          />
          {!showAdvancedSettings &&
            <ActionButton sx={{ height: '28px', width: '28px' }} onClick={onClickAdvancedSettings}>
              <SettingIcon sx={{ fontSize: 16 }} />
            </ActionButton>}
          <ActionButton
            aria-label="clear the chat"
            disabled={isStreaming}
            onClick={onDeleteAll}
            sx={{ height: '28px', width: '28px' }}
          >
            <ClearIcon sx={{ fontSize: 16 }} />
          </ActionButton>
        </Box>

        {!showAdvancedSettings &&
          <ChatSettings
            selectedEmbeddingModel={chatSettings?.chat_settings_embedding || {}}
            onChangeEmbeddingModel={(integrationUid, modelName) => {
              onChangeChatSettings('chat.chat_settings_embedding',
                {
                  integration_uid: integrationUid,
                  model_name: modelName,
                });
            }}
            selectedChatModel={chatSettings?.chat_settings_ai || {}}
            onChangeChatModel={(integrationUid, modelName) => {
              onChangeChatSettings('chat.chat_settings_ai',
                {
                  integration_uid: integrationUid,
                  model_name: modelName,
                });
            }}
          />
        }
        {
          showAdvancedSettings && isSmallWindow &&
          <Box sx={{ marginY: '24px', paddingX: '2px' }}>
            <AdvancedChatSettings
              selectedEmbeddingModel={chatSettings?.chat_settings_embedding || {}}
              onChangeEmbeddingModel={(integrationUid, modelName) => {
                onChangeChatSettings('chat.chat_settings_embedding',
                  {
                    integration_uid: integrationUid,
                    model_name: modelName,
                  });
              }}
              selectedChatModel={chatSettings?.chat_settings_ai || {}}
              onChangeChatModel={(integrationUid, modelName) => {
                onChangeChatSettings('chat.chat_settings_ai',
                  {
                    integration_uid: integrationUid,
                    model_name: modelName,
                  });
              }}
              top_k={chatSettings?.chat_settings_embedding?.top_k}
              onChangeTopK={(value) => onChangeChatSettings('chat.chat_settings_embedding.top_k', value)}
              temperature={chatSettings?.chat_settings_ai?.temperature}
              onChangeTemperature={(value) => onChangeChatSettings('chat.chat_settings_ai.temperature', value)}
              top_p={chatSettings?.chat_settings_ai?.top_p}
              onChangeTopP={(value) => onChangeChatSettings('chat.chat_settings_ai.top_p', value)}
              ai_top_k={chatSettings?.chat_settings_ai?.top_k}
              onChangeAITopK={(value) => onChangeChatSettings('chat.chat_settings_ai.top_k', value)}
              maximum_length={chatSettings?.chat_settings_ai?.maximum_length}
              onChangeMaxLength={(value) => onChangeChatSettings('chat.chat_settings_ai.maximum_length', value)}
              onCloseAdvancedSettings={onCloseAdvancedSettings}
              fetch_k={chatSettings?.chat_settings_embedding?.fetch_k}
              onChangeFetchK={(value) => onChangeChatSettings('chat.chat_settings_embedding.fetch_k', value)}
              page_top_k={chatSettings?.chat_settings_embedding?.page_top_k}
              onChangePageTopK={(value) => onChangeChatSettings('chat.chat_settings_embedding.page_top_k', value)}
              cut_off_score={chatSettings?.chat_settings_embedding?.cut_off_score}
              onChangeCutoffScore={(value) => onChangeChatSettings('chat.chat_settings_embedding.cut_off_score', value)}
            />
          </Box>
        }

        <ChatBoxContainer
          role="presentation"
          sx={{ marginTop: '24px' }}
        >
          <ChatBodyContainer>
            <MessageList sx={{ height: '468px' }}>
              {
                chatHistory.map((message, index) => {
                  switch (message.role) {
                    case ROLES.User:
                      return <UserMessage
                        key={message.id}
                        ref={(ref) => (listRefs.current[index] = ref)}
                        content={message.content}
                        onCopy={onCopyToClipboard(message.id)}
                        onDelete={onDeleteAnswer(message.id)}
                      />
                    case ROLES.Assistant:
                      return <AIAnswer
                        key={message.id}
                        answer={message.content}
                        ref={(ref) => (listRefs.current[index] = ref)}
                        references={message.references}
                        isLoading={Boolean(message.isLoading)}
                        isStreaming={message.isStreaming}
                        onStop={onStopStreaming(message)}
                        onCopy={onCopyToClipboard(message.id)}
                        onDelete={onDeleteAnswer(message.id)}
                        onRegenerate={onRegenerateAnswer(message.id)}
                        shouldDisableRegenerate={isStreaming || Boolean(message.isLoading)}
                      />
                    default:
                      // eslint-disable-next-line no-console
                      console.error('Unknown message role', message.role)
                      return ''
                  }
                })
              }
              <div ref={messagesEndRef} />
            </MessageList>
            <ChatInput
              ref={chatInput}
              onSend={onPredict}
              isLoading={isStreaming}
              disabledSend={isStreaming || !chatSettings?.chat_settings_ai?.model_name || !chatSettings?.chat_settings_embedding?.model_name}
              shouldHandleEnter
            />
          </ChatBodyContainer>
        </ChatBoxContainer>
      </Box>
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
};

export default ChatPanel;
import {
  ROLES,
  SocketMessageType,
  ChatBoxMode,
  StreamingMessageType,
  sioEvents,
  ToolActionStatus
} from '@/common/constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AUTO_SCROLL_KEY } from './AutoScrollToggle';
import useSocket, { useManualSocket } from '@/hooks/useSocket';
import { useIsFromChat, useProjectId } from '@/pages/hooks';
import { v4 as uuidv4 } from 'uuid';
import { useStopDatasourceTaskMutation } from '@/api/datasources';
import { useStopApplicationTaskMutation } from '@/api/applications';

export const useCtrlEnterKeyEventsHandler = ({ onShiftEnterPressed, onCtrlEnterDown, onEnterDown, onNormalKeyDown }) => {
  const keysPressed = useMemo(() => ({}), [])
  const [isInComposition, setIsInComposition] = useState(false)
  const onKeyDown = useCallback(
    (event) => {
      if (isInComposition) {
        return
      }
      keysPressed[event.key] = true
      if (keysPressed['Control'] && event.key === 'Enter' && onCtrlEnterDown) {
        onCtrlEnterDown()
      } else if (keysPressed['Shift'] && event.key === 'Enter' && onShiftEnterPressed) {
        onShiftEnterPressed()
      } else if (!keysPressed['Control'] && !keysPressed['Shift'] && event.key === 'Enter' && onEnterDown) {
        onEnterDown(event)
      } else {
        if (onNormalKeyDown) {
          onNormalKeyDown(event);
        }
      }
    },
    [isInComposition, keysPressed, onCtrlEnterDown, onEnterDown, onShiftEnterPressed, onNormalKeyDown],
  );

  const onKeyUp = useCallback(
    (event) => {
      delete keysPressed[event.key]
    },
    [keysPressed],
  )

  const onCompositionStart = useCallback(() => {
    setIsInComposition(true)
  }, [])
  const onCompositionEnd = useCallback(() => {
    setIsInComposition(false)
  }, [])

  return { onKeyDown, onKeyUp, onCompositionStart, onCompositionEnd }
}

export const useStopStreaming = ({
  chatHistoryRef,
  chatHistory,
  setChatHistory,
  manualEmit,
}) => {
  const isStreaming = useMemo(() => chatHistory.some(msg => msg.isStreaming), [chatHistory]);
  const [stopDatasourceTask, { isError: isStopDatasourceTaskError, error: stopDatasourceError }] = useStopDatasourceTaskMutation();
  const [stopApplicationTask, { isError: isStopApplicationTaskError, error: stopApplicationError } ] = useStopApplicationTaskMutation();
  const isStopError = useMemo(() => isStopApplicationTaskError || isStopDatasourceTaskError, [isStopApplicationTaskError, isStopDatasourceTaskError])
  const stopError = useMemo(() => stopApplicationError || stopDatasourceError, [stopApplicationError, stopDatasourceError])
  const projectId = useProjectId();
  const onStopStreaming = useCallback(
    (message) => async () => {
      const { id: streamId, task_id, participant } = message
      const { type } = participant
      if (task_id) {
        if (type == 'datasource') {
          await stopDatasourceTask({ projectId, task_id })
        } else if (type === 'application') {
          await stopApplicationTask({ projectId, task_id })
        }
      }
      manualEmit([streamId]);
      setTimeout(() => setChatHistory(prevState =>
        prevState.map(msg => ({
          ...msg,
          isStreaming: msg.id === streamId ? false : msg.isStreaming,
          isLoading: msg.id === streamId ? false : msg.isLoading,
          task_id: undefined,
        }))
      ), 200);
    },
    [manualEmit, projectId, setChatHistory, stopApplicationTask, stopDatasourceTask],
  );

  const onStopAll = useCallback(async () => {
    const streamIds = chatHistoryRef.current.filter(message => message.role !== ROLES.User && message.isStreaming).map(message => message.id);
    const messagesWithTaskId = chatHistoryRef.current.filter(message => message.role !== ROLES.User && message.task_id && message.isStreaming)
    messagesWithTaskId.forEach(async (message) => {
      const { participant: { type }, task_id } = message;
      if (type == 'datasource') {
        await stopDatasourceTask({ projectId, task_id })
      } else if (type === 'application') {
        await stopApplicationTask({ projectId, task_id })
      }
    });
    manualEmit(streamIds);
    setTimeout(() => setChatHistory(prevState =>
      prevState.map(msg => ({ ...msg, isStreaming: false, isLoading: false, task_id: undefined }))
    ), 200);
  }, [chatHistoryRef, manualEmit, projectId, setChatHistory, stopApplicationTask, stopDatasourceTask]);

  useEffect(() => {
    return () => {
      onStopAll();
    };
  }, [onStopAll])

  return {
    isStreaming,
    onStopAll,
    onStopStreaming,
    isStopError,
    stopError,
  }
}

export const useSocketEvents = (isApplicationChat) => {
  const isFromChat = useIsFromChat();
  const { subscribeEvent, leaveEvent } = useMemo(() => {
    if (!isFromChat) {
      return isApplicationChat ? {
        subscribeEvent: sioEvents.application_predict,
        leaveEvent: sioEvents.application_leave_rooms
      } : {
        subscribeEvent: sioEvents.promptlib_predict,
        leaveEvent: sioEvents.promptlib_leave_rooms
      }
    } else {
      return {
        subscribeEvent: sioEvents.chat_predict,
        leaveEvent: sioEvents.chat_leave_rooms
      }
    }
  }, [isApplicationChat, isFromChat])

  return { subscribeEvent, leaveEvent }
}

export const useChatSocket = ({
  mode,
  handleError,
  setIsRunning,
  listRefs,
  isApplicationChat,
  chatHistory,
  setChatHistory,
  activeParticipant,
}) => {
  const [completionResult, setCompletionResult] = useState(
    [{
      id: uuidv4(),
      role: ROLES.Assistant,
      isLoading: false,
      content: '',
    }]
  )
  const modeRef = useRef(mode);
  const chatHistoryRef = useRef(chatHistory);
  const completionResultRef = useRef(completionResult);
  const messagesEndRef = useRef();
  const activeParticipantRef = useRef();

  useEffect(() => {
    activeParticipantRef.current = activeParticipant;
  }, [activeParticipant]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  useEffect(() => {
    completionResultRef.current = completionResult;
  }, [completionResult]);

  const getMessage = useCallback((messageId) => {
    if (modeRef.current === ChatBoxMode.Chat) {
      const msgIdx = chatHistoryRef.current?.findIndex(i => i.id === messageId) || -1;
      let msg
      if (msgIdx < 0) {
        msg = {
          id: messageId,
          role: ROLES.Assistant,
          content: '',
          participant: activeParticipantRef.current ? { ...activeParticipantRef.current } : undefined,
          isLoading: false,
          created_at: new Date().getTime()
        }
      } else {
        msg = chatHistoryRef.current[msgIdx]
      }
      return [msgIdx, msg]
    } else {
      const msgIdx = completionResultRef.current?.findIndex(i => i.id === messageId);
      let msg
      if (msgIdx < 0) {
        msg = {
          id: messageId,
          role: ROLES.Assistant,
          content: '',
          isLoading: false,
        }
      } else {
        msg = completionResultRef.current[msgIdx]
      }
      return [msgIdx, msg]
    }
  }, [activeParticipantRef])


  const scrollToMessageListEnd = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [])
  
  const handleSocketEvent = useCallback(async message => {
    const { stream_id, message_id, type: socketMessageType, message_type, response_metadata } = message
    const { task_id } = message.content instanceof Object ? message.content : {}
    const [msgIndex, msg] = getMessage(stream_id || message_id, message_type)

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
    let t

    switch (socketMessageType) {
      case SocketMessageType.StartTask:
        msg.isLoading = true
        msg.isStreaming = true
        msg.content = ''
        msg.references = []
        msg.task_id = task_id
        if (message_type !== StreamingMessageType.Freeform) {
          msgIndex === -1 ? setChatHistory(prevState => [...prevState, msg]) : setChatHistory(prevState => {
            prevState[msgIndex] = msg
            return [...prevState]
          })
        } else {
          msgIndex === -1 ? setCompletionResult([msg]) : setCompletionResult(prevState => {
            prevState[msgIndex] = msg
            return [...prevState]
          })
        }
        setTimeout(scrollToMessageBottom, 0);
        break
      case SocketMessageType.Chunk:
      case SocketMessageType.AIMessageChunk:
      case SocketMessageType.AgentResponse:
        msg.content += message.content
        msg.isLoading = false
        setTimeout(scrollToMessageBottom, 0);
        if (response_metadata?.finish_reason) {
          if (message_type === StreamingMessageType.Freeform) {
            setIsRunning(false);
          } else {
            msg.isStreaming = false
          }
        }
        break
      case SocketMessageType.AgentToolStart:
        if (msg.toolActions === undefined) {
          msg.toolActions = []
        }
        if (!msg.toolActions.find(i => i.id === message?.response_metadata?.tool_run_id)) {
          msg.toolActions.push({
            name: message?.response_metadata?.tool_name,
            id: message?.response_metadata?.tool_run_id,
            status: ToolActionStatus.processing
          })
        }
        break
      case SocketMessageType.AgentToolEnd:
        t = msg.toolActions.find(i => i.id === message?.response_metadata?.tool_run_id)
        if (t) {
          Object.assign(t, {
            content: message?.content,
            status: ToolActionStatus.complete
          })
        }
        break
      case SocketMessageType.AgentToolError:
        t = msg.toolActions.find(i => i.id === message?.response_metadata?.tool_run_id)
        if (t) {
          Object.assign(t, {
            content: message?.content,
            status: ToolActionStatus.error
          })
        }
        break
      case SocketMessageType.References:
        msg.references = message.references
        break
      case SocketMessageType.Error:
        msg.isLoading = false
        msg.isStreaming = false
        handleError({ data: message.content || [] })
        return
      case SocketMessageType.AgentException: {
        msg.isLoading = false
        msg.isStreaming = false;
        msg.exception = message.content;
        break;
      }
      case SocketMessageType.Freeform:
        break
      default:
        // eslint-disable-next-line no-console
        console.warn('unknown message type', socketMessageType)
        return
    }
    if (message_type !== StreamingMessageType.Freeform) {
      msgIndex > -1 && setChatHistory(prevState => {
        prevState[msgIndex] = msg
        return [...prevState]
      })
    } else {
      msgIndex > -1 && setCompletionResult(prevState => {
        prevState[msgIndex] = msg
        return [...prevState]
      })
    }
  }, [getMessage, listRefs, scrollToMessageListEnd, handleError, setChatHistory, setIsRunning])

  const { subscribeEvent, leaveEvent } = useSocketEvents(isApplicationChat)

  const { emit } = useSocket(subscribeEvent, handleSocketEvent)

  const { emit: manualEmit } = useManualSocket(leaveEvent);

  return {
    chatHistoryRef,
    scrollToMessageListEnd,
    emit,
    manualEmit,
    completionResult,
    setCompletionResult,
    messagesEndRef,
  }
}

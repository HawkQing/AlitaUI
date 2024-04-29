import {
  ROLES,
  SocketMessageType,
  ChatBoxMode,
  StreamingMessageType,
  sioEvents,
  ChatParticipantType,
  ToolActionStatus
} from '@/common/constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AUTO_SCROLL_KEY } from './AutoScrollToggle';
import useSocket, { useManualSocket } from '@/hooks/useSocket';
import { useIsFromChat } from '@/pages/hooks';

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

  const onStopStreaming = useCallback(
    (streamId) => () => {
      manualEmit([streamId]);
      setTimeout(() => setChatHistory(prevState =>
        prevState.map(msg => ({
          ...msg,
          isStreaming: msg.id === streamId ? false : msg.isStreaming
        }))
      ), 200);
    },
    [manualEmit, setChatHistory],
  );

  const onStopAll = useCallback(() => {
    const streamIds = chatHistoryRef.current.filter(message => message.role !== ROLES.User).map(message => message.id);
    manualEmit(streamIds);
    setTimeout(() => setChatHistory(prevState =>
      prevState.map(msg => ({ ...msg, isStreaming: false }))
    ), 200);
  }, [chatHistoryRef, manualEmit, setChatHistory]);


  useEffect(() => {
    return () => {
      onStopAll();
    };
  }, [onStopAll])

  return {
    isStreaming,
    onStopAll,
    onStopStreaming
  }
}

export const useSocketEvents = (isApplicationChat, participantType) => {
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
      switch (participantType) {
        case ChatParticipantType.Models:
        case ChatParticipantType.Prompts:
          return {
            subscribeEvent: sioEvents.promptlib_predict,
            leaveEvent: sioEvents.promptlib_leave_rooms
          }
        case ChatParticipantType.Applications:
          return {
            subscribeEvent: sioEvents.application_predict,
            leaveEvent: sioEvents.application_leave_rooms
          }
        case ChatParticipantType.Datasources: {
          return {
            subscribeEvent: sioEvents.datasource_predict,
            leaveEvent: sioEvents.datasource_leave_rooms
          }
        }
        default:
          return {
            subscribeEvent: '',
            leaveEvent: ''
          }
      }
    }

  }, [isApplicationChat, isFromChat, participantType])

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
      id: new Date().getTime(),
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
          participant: activeParticipantRef ? { ...(activeParticipantRef.current || {}) } : undefined,
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
    let t

    switch (socketMessageType) {
      case SocketMessageType.StartTask:
      // case 'agent_start':
        msg.isLoading = true
        msg.isStreaming = false
        msg.content = ''
        msg.references = []
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
        msg.isStreaming = true
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
        msg.exception = message.exception;
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

  const { subscribeEvent, leaveEvent } = useSocketEvents(isApplicationChat, activeParticipant?.type)

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

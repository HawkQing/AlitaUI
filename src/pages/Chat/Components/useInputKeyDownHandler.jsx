import { ChatMentionSymbolTypeMap } from '@/common/constants';
import { useCallback, useEffect, useState, useMemo } from 'react';

const SpecialSymbolsString = '/#@>'

const useInputKeyDownHandler = (participants) => {
  const [isProcessingSymbols, setIsProcessingSymbols] = useState(false)
  const [participantType, setParticipantType] = useState('')
  const [query, setQuery] = useState('')
  const realQuery = useMemo(() => query.slice(1), [query])
  const [notMatchedCount, setNotMatchedCount] = useState(0)
  const theSelectedParticipants = useMemo(() => participants?.filter(participant => participant.type === participantType) || [], [participantType, participants])

  const suggestions = useMemo(() => {
    if (isProcessingSymbols) {
      return !realQuery ?
        theSelectedParticipants :
        theSelectedParticipants.filter(
          participant => (participant.name || participant.model_name).startsWith(realQuery)
        )
    }
    return []
  }, [isProcessingSymbols, theSelectedParticipants, realQuery])

  const onKeyDown = useCallback(
    (event) => {
      if (!isProcessingSymbols && event.key.length === 1 && SpecialSymbolsString.includes(event.key)) {
        setIsProcessingSymbols(true);
        setQuery(event.key);
        setParticipantType(ChatMentionSymbolTypeMap[event.key])
      } else if (isProcessingSymbols) {
        if (event.key.length === 1 && event.key.match(/^[\w\s]+$/)) {
          setQuery(prev => prev + event.key);
        } else if (event.key === 'Backspace') {
          setQuery(prev => prev.slice(0, -1));
        }
      }
    },
    [isProcessingSymbols],
  )

  const reset = useCallback(
    () => {
      setIsProcessingSymbols(false);
      setNotMatchedCount(0);
      setQuery('');
    },
    [],
  )

  useEffect(() => {
    if (realQuery) {
      if (!participants.filter(
        participant => (participant.name || participant.model_name).startsWith(realQuery)
      ).length) {
        setNotMatchedCount(prev => prev + 1);
      } else {
        setNotMatchedCount(0);
      }
    } else {
      setNotMatchedCount(0);
    }
  }, [participants, realQuery])

  useEffect(() => {
    if (notMatchedCount > 1 || !query || (!theSelectedParticipants.length && notMatchedCount)) {
      reset();
    }
  }, [notMatchedCount, theSelectedParticipants.length, query, reset])

  return {
    onKeyDown,
    suggestions,
    participantType,
    isProcessingSymbols,
    query,
    stopProcessingSymbols: reset
  }
}

export default useInputKeyDownHandler

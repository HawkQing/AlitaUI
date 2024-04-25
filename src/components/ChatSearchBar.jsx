import {
  ClickAwayListener,
  Popper
} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  SearchPanel,
  StyledCancelIcon,
  StyledInputBase,
  StyledSearchIcon,
} from './SearchBarComponents';
import ChatSuggestionList from './ChatSuggestionList';
import eventEmitter from '@/common/eventEmitter';
import { ChatSearchEvents } from '@/common/constants';

export default function ChatSearchBar({
  searchString,
  setSearchString,
  onClear,
}) {

  // input props
  const isEmptyInput = useMemo(() => !searchString || searchString.trim() === '', [searchString]);
  const showSearchButton = useMemo(() => Boolean(searchString), [searchString]);

  // dropdown related
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);
  const popperId = useMemo(() => open ? 'search-bar-popper' : undefined, [open]);

  const handleFocus = useCallback(() => {
    if (panelRef) {
      setAnchorEl(panelRef.current);
    }
  }, []);

  const handleClickAway = useCallback(() => {
    setAnchorEl(null);
    if (inputRef.current) {
      inputRef.current.blur();
    }
    onClear()
  }, [onClear]);


  // auto suggest list items interactions
  const handleInputChange = useCallback(
    (event) => {
      const newInputValue = event.target.value;
      setSearchString(newInputValue);
      if (newInputValue === '') {
        onClear();
      }
    },
    [onClear, setSearchString],
  );

  const onSelectParticipant = useCallback(
    (type, participant) => {
      eventEmitter.emit(ChatSearchEvents.SelectParticipant, { type, participant })
    },
    [],
  )

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway} >
        <SearchPanel ref={panelRef}>
          <StyledSearchIcon />
          <StyledInputBase
            placeholder='Let’s add participants to your conversation!'
            inputProps={{ 'aria-label': 'search' }}
            inputRef={inputRef}
            onChange={handleInputChange}
            onFocus={handleFocus}
            value={searchString}
            endAdornment={
              showSearchButton &&
              <InputAdornment position='end'>
                <StyledCancelIcon onClick={onClear} />
              </InputAdornment>
            }
          />
          <Popper
            id={popperId}
            open={open}
            anchorEl={anchorEl}
            placement='bottom-start'
            style={{ width: panelRef.current?.clientWidth, zIndex: '1101' }}
          >
            <ChatSuggestionList
              searchString={searchString}
              isEmptyInput={isEmptyInput}
              onSelectParticipant={onSelectParticipant}
            />
          </Popper>
        </SearchPanel>
      </ClickAwayListener>
    </>
  )
}
import {
  MIN_SEARCH_KEYWORD_LENGTH
} from '@/common/constants';
import { actions } from '@/slices/search';
import {
  ClickAwayListener,
  Popper} from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  SearchPanel,
  StyledCancelIcon,
  StyledInputBase,
  StyledSearchIcon,
  StyledSendIcon,
} from './SearchBarComponents';
import useToast from './useToast';
import ChatSuggestionList from './ChatSuggestionList';

export default function ChatSearchBar({
  searchString,
  setSearchString,
  onClear,
}) {
  const { query } = useSelector(state => state.search);
  const disableSearchButton = useMemo(() => !searchString || query === searchString, [query, searchString]);

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
  }, []);


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

  const handleClickTop = useCallback((search_keyword) => {
    handleInputChange({ target: { value: search_keyword } })
  }, [handleInputChange]);


  // search logics
  const dispatch = useDispatch();
  const { ToastComponent: Toast, toastInfo } = useToast();
  const onSearch = useCallback(
    () => {
      handleClickAway();
      if (isEmptyInput) {
        dispatch(actions.setQuery({ query: ''}));
        return;
      }

      const trimmedSearchString = searchString.trim();
      setSearchString(trimmedSearchString);
      if (trimmedSearchString.length >= MIN_SEARCH_KEYWORD_LENGTH) {
        const isChanged = query !== trimmedSearchString;
        if (isChanged) {
          dispatch(actions.setQuery({ query: trimmedSearchString }));
        }
      } else {
        toastInfo('The search key word should be at least 3 letters long');
      }
    },
    [dispatch, handleClickAway, isEmptyInput, query, searchString, setSearchString, toastInfo],
  );

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') {
        onSearch();
      }
    },
    [onSearch],
  );

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
            placeholder='Let’s find something amaizing!'
            inputProps={{ 'aria-label': 'search' }}
            inputRef={inputRef}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={onKeyDown}
            value={searchString}
            endAdornment={
              showSearchButton &&
              <InputAdornment position='end'>
                <StyledCancelIcon onClick={onClear} />
                <StyledSendIcon
                  disabled={disableSearchButton}
                  onClick={onSearch}
                />
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
              handleClickTop={handleClickTop}
            />
          </Popper>
          <Toast />
        </SearchPanel>
      </ClickAwayListener>
    </>
  )
}
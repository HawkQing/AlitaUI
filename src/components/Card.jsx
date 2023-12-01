import { ContentType, PromptStatus, ViewMode } from '@/common/constants';
import { getInitials, stringToColor } from '@/common/utils';
import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled'; 
import { Avatar } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CommentIcon from './Icons/CommentIcon';
import ConsoleIcon from './Icons/ConsoleIcon';
import FolderIcon from './Icons/FolderIcon';
import StarIcon from './Icons/StarIcon';
import StarActiveIcon from './Icons/StarActiveIcon';
import TrophyIcon from './Icons/TrophyIcon';
import BookmarkIcon from './Icons/BookmarkIcon';
import CardPopover from '@/components/CardPopover'

const MOCK_ISTOP = true;
const MOCK_FAVORITE_COUNT = 20;
const MOCK_COMMENT_COUNT = 10;
const MOCK_AVATARS = [
  'https://i.pravatar.cc/300?a=1',
  'https://i.pravatar.cc/300?a=2',
  'https://i.pravatar.cc/300?a=3',
  'https://i.pravatar.cc/300?a=4',
  'https://i.pravatar.cc/300?a=5',
];

const DOUBLE_LINE_HIGHT = 48;
const MAX_NUMBER_TAGS_SHOWN = 2;
const MAX_NUMBER_AVATARS_SHOWN = 3;
const MAX_NUMBER_NAME_SHOWN = 1;

const getStatusColor = (status, theme) => {
  switch (status) {
    case PromptStatus.Draft:
      return theme.palette.status.draft;
    case PromptStatus.onModeration:
      return theme.palette.status.onModeration;
    case PromptStatus.published:
      return theme.palette.status.published;
    case PromptStatus.rejected:
      return theme.palette.status.rejected;
    default:
      return theme.palette.status.userApproval;
  }
}

const stringAvatar = (name) => {
  return {
    sx: {
      bgcolor: stringToColor(name),
      color: 'white',
      fontSize: '0.6rem',
    },
    children: `${getInitials(name)}`,
  };
};

const StyledCard = styled(Card)(({ theme }) => ({
  width: '315.33px',
  height: '192px',
  margin: '10px 22px',
  background: theme.palette.background.secondaryBg,
}));

const StyledConsoleIcon = styled(ConsoleIcon)(() => ({
  width: '1rem',
  height: '1rem',
  transform: 'translate(4px, 4px)',
}));

const StyledFolderIcon = styled(FolderIcon)(() => ({
  width: '1rem',
  height: '1rem',
  transform: 'translate(4px, 4px)'
}));

const StyledCarContent = styled(CardContent)(() => ({
  padding: '0',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
}));

const StyledCardTopSection = styled('div')(() => ({
  height: '96px',
  padding: '0.5rem 1rem 0rem 1rem',
  marginBottom: '8px',
  cursor: 'pointer',
}));

const StyledCardTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontFamily: 'Montserrat',
  fontSize: '0.875rem',
  lineHeight: '1.5rem',
  fontWeight: '600',
  maxHeight: '48px',
  marginBottom: '0',
  wordWrap: 'break-word',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: '2',
}));

const StyledCardDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontFamily: 'Montserrat',
  fontSize: '0.75rem',
  lineHeight: '16px',
  fontWeight: '400',
  maxHeight: '60px',
  marginBottom: '0',
  wordWrap: 'break-word',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
}));

const StyledCardMidSection = styled('div')(() => ({
  display: 'flex',
  height: '28px',
  marginBottom: '8px',
  padding: '0 10px',
}));

const StyledCardBottomSection = styled('div')(({ theme }) => ({
  marginBottom: '-1.5rem',
  borderTop: `1px solid ${theme.palette.border.activeBG}`,
  height: '52px',
  padding: '0 10px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const StyledMidSelectionItem = styled('span')(({ theme }) => ({
  fontFamily: 'Montserrat',
  fontSize: '0.75rem',
  lineHeight: '1rem',
  fontWeight: '400',
  color: theme.palette.text.primary,
  width: '67px',
  height: '28px',
}));

const StyledAuthorNameContainer = styled('div')(({ theme }) => ({
  caretColor: 'transparent',
  marginLeft: '5px',
  wordWrap: 'break-word',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: '1',
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.text.secondary,
  },
}));

const StyledExtraAvatarCountsContainer = styled('div')(({ theme }) => ({
  caretColor: 'transparent',
  width: '28px',
  height: '28px',
  lineHeight: '28px',
  margin: '0 auto',
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.text.secondary,
  },
}));

const StyledExtraNameCountsContainer = styled('div')(({ theme }) => ({
  caretColor: 'transparent',
  marginLeft: '0.5rem',
  cursor: 'pointer',
  '&:hover': {
    color: theme.palette.text.secondary,
  },
}));

const StyledInfoContainer = styled('div')(({ theme }) => ({
  fontFamily: 'Montserrat',
  display: 'flex',
  width: '99px',
  height: '28px',
  '& .item-pair': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '52px',
    padding: '6px 8px 6px 8px',
    borderRadius: '0.5rem',
    caretColor: 'transparent',
    cursor: 'pointer',
  },
  '& .icon-size': {
    width: '16px',
    height: '16px',
  },
  '& .icon-font': {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: '400',
  },
  '& .item-pair:hover': {
    background: theme.palette.background.icon.default,
  },
}));

const StyledExtraTagCountsContainer = styled('span')(({ theme }) => ({
  '&:hover': {
    color: theme.palette.text.secondary,
  },
}));

const StyledStatusIndicator = styled('div', {
  shouldForwardProp: prop => isPropValid(prop)
})(({ status, theme }) => (`
  width: 0.1875rem;
  height: 1rem;
  position: absolute;
  left: 0.0625rem;
  top: 0.75rem;
  border-radius: 0.25rem;
  background: ${getStatusColor(status, theme)};
`));

const MidSelectionItem = ({ text, noDivider = true, paddingLeft = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'auto',
        caretColor: 'transparent',
      }}
    >
      <StyledMidSelectionItem>
        {paddingLeft ? '\u00A0\u00A0\u00A0' : null}
        {text}
        {'\u00A0\u00A0\u00A0'} {noDivider ? '' : '|'}
      </StyledMidSelectionItem>
    </div>
  );
};

const MidSelectionItemLabel = ({ isTop }) => {
  return (
    <div style={{ marginLeft: 'auto', display: isTop ? 'block' : 'none' }}>
      <TrophyIcon />
    </div>
  );
};

const PromptTags = ({ tags }) => {
  const cardPopoverRef = useRef(null);
  const handleTagNumberClick = useCallback((event) => {
    cardPopoverRef.current.handleClick(event);
  }, []);
  return (
    <>
      <MidSelectionItem noDivider={!tags.length} paddingLeft={false} text={<StyledConsoleIcon />} />
      {tags.map((tag, index) => {
        if (index > MAX_NUMBER_TAGS_SHOWN - 1) return;
        const tagName = tag.name;
        const tagId = tag.id;
        return (
          <MidSelectionItem
            key={tagId}
            text={tagName}
            noDivider={index === tags.length - 1 || index === MAX_NUMBER_TAGS_SHOWN - 1}
          />
        );
      })}
      {tags.length - MAX_NUMBER_TAGS_SHOWN > 0 ? (
        <StyledExtraTagCountsContainer>
          <MidSelectionItem text={`+${tags.length - MAX_NUMBER_TAGS_SHOWN}`} noDivider={true} onClick={handleTagNumberClick}/>
        </StyledExtraTagCountsContainer>
      ) : null}
      <CardPopover ref={cardPopoverRef} contentList={tags} type={'category'}/>
      <MidSelectionItemLabel isTop={MOCK_ISTOP} />
  </>
  );
};

const AuthorContainer = ({ authors = [] }) => {
  const avatarsContainerStyle = {
    fontFamily: 'Montserrat',
    width: '180px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    lineHeight: '16px',
  };
  const avatarStyle = {
    padding: '0',
    width: '20px',
    height: '20px',
  };
  const textStyle = {
    marginLeft: '5px',
    wordWrap: 'break-word',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: '1',
  };
  const firstThreeAvatars = authors.slice(0, MAX_NUMBER_AVATARS_SHOWN);
  const extraAvatarCounts = authors.length - MAX_NUMBER_AVATARS_SHOWN;
  const extraNameCounts = authors.length - MAX_NUMBER_NAME_SHOWN;
  const cardPopoverRef = useRef(null);
  const handleAuthorNumberClick = useCallback((event) => {
    cardPopoverRef.current.handleClick(event);
  }, []);

  return (
    <div style={avatarsContainerStyle}>
      {firstThreeAvatars.map(({ id, name, avatar }, index) => {
        if (!avatar) {
          return (
            <Avatar
              key={id}
              style={{
                ...avatarStyle,
                transform: `translateX(-${index * 3}px)`,
              }}
              {...stringAvatar(name)}
            />
          );
        }
        return (
          <Avatar
            key={id}
            style={{ ...avatarStyle, transform: `translateX(-${index * 3}px)` }}
            src={MOCK_AVATARS[Math.floor(Math.random() * 5)]}
          />
        );
      })}
      {extraAvatarCounts > 0 ? (
        <StyledExtraAvatarCountsContainer>
          +{extraAvatarCounts}
        </StyledExtraAvatarCountsContainer>
      ) : null}
      <StyledAuthorNameContainer style={textStyle}>
        <div>{authors[0].name}</div>
      </StyledAuthorNameContainer>
      <StyledExtraNameCountsContainer onClick={handleAuthorNumberClick}>
        {extraNameCounts > 0 ? `+${extraNameCounts}` : null}
      </StyledExtraNameCountsContainer>
      <CardPopover ref={cardPopoverRef} contentList={authors} type={'author'} />
    </div>
  );
};

const InfoContainer = ({type = ContentType.Prompts, id, name}) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(MOCK_FAVORITE_COUNT);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const doNavigateWithAnchor = useCallback(() => {
    navigate(`/prompt/${id}#comments`, {
      state: {
        from: pathname,
        breadCrumb: name,
      },
    });
  }, [id, name, navigate, pathname]);

  const handleLikeClick = useCallback(() => {
    if (liked) {
      setLikes((prev) => prev - 1);
    } else {
      setLikes((prev) => prev + 1);
    }
    setLiked(!liked);
  }, [liked]);
  return (
    <>
    {
      (type === ContentType.All || type === ContentType.Prompts) &&
      <StyledInfoContainer>
      <div className={'item-pair'} onClick={handleLikeClick}>
        {liked ? (
          <StarActiveIcon className={'icon-size'} />
        ) : (
          <StarIcon className={'icon-size'} />
        )}
        <div className={'icon-font'}>{likes}</div>
      </div>
      <div className={'item-pair'} onClick={doNavigateWithAnchor}>
        <CommentIcon className={'icon-size'} />
        <div className={'icon-font'}>{MOCK_COMMENT_COUNT}</div>
      </div>
    </StyledInfoContainer>
    }
    {
      type === ContentType.Collections &&
      <StyledInfoContainer>
        <div className={'item-pair'}>
          <BookmarkIcon className={'icon-size'} />
          <div className={'icon-font'}>{MOCK_COMMENT_COUNT}</div>
        </div>
      </StyledInfoContainer>
    }
    </>
  );
};

export default function PromptCard({ data = {}, viewMode, type }) {
  const { id, name = '', description = '', authors = [], tags = [], promptCount = 0 } = data;
  const initialCardDescriptionHeight = 2;
  const [lineClamp, setLineClamp] = useState(initialCardDescriptionHeight);
  const { pathname } = useLocation();
  const cardTitleRef = useRef(null);

  const isTitleSingleRow = () => {
    return cardTitleRef.current.offsetHeight < DOUBLE_LINE_HIGHT;
  };
  useEffect(() => {
    const cardDescriptionHeight = isTitleSingleRow() ? 3 : 2;
    setLineClamp(cardDescriptionHeight);
  }, []);

  const navigate = useNavigate();
  const doNavigate = useCallback(() => {
    navigate(`/prompt/${id}`, {
      state: {
        from: pathname,
        breadCrumb: name,
        viewMode,
      },
    });
  }, [navigate, id, pathname, name, viewMode]);

  return (
    <div style={{ width: '100%' }}>
      <StyledCard sx={{ minWidth: 275, display: 'inline' }}>
        <StyledCarContent>
          {
            viewMode === ViewMode.Owner && <StyledStatusIndicator/>
          }
          <StyledCardTopSection onClick={doNavigate}>
            <StyledCardTitle
              ref={cardTitleRef}
              sx={{ fontSize: 14 }}
              color='text.secondary'
              gutterBottom
            >
              {name}
            </StyledCardTitle>
            <StyledCardDescription
              sx={{ mb: 1.5 }}
              color='text.secondary'
              style={{ WebkitLineClamp: lineClamp, marginTop: '0.25rem' }}
            >
              {description}
            </StyledCardDescription>
          </StyledCardTopSection>
          <StyledCardMidSection color='text.secondary'>
            { 
              (type === ContentType.All || type === ContentType.Prompts) &&
              <PromptTags tags={tags}/>
          }
          {
            type === ContentType.Collections &&
            <>
              <MidSelectionItem text={<StyledFolderIcon />} noDivider={false} />
              <MidSelectionItem text={promptCount} noDivider={true} />
            </>
          }
          </StyledCardMidSection>
          <StyledCardBottomSection color='text.secondary'>
            <AuthorContainer authors={authors} />
            <InfoContainer type={type} id={id} name={name}/>
          </StyledCardBottomSection>
        </StyledCarContent>
      </StyledCard>
    </div>
  );
}

import { useMemo } from 'react';
import { useMatch } from 'react-router-dom';
import RouteDefinitions from '@/routes';

const useSearchBar = () => {
  const isFromChat = useMatch({ path: RouteDefinitions.Chat });
  const isPublicPromptsPage = useMatch({ path: RouteDefinitions.PromptsWithTab });
  const isPublicCollectionsPage = useMatch({ path: RouteDefinitions.CollectionsWithTab });
  const isMyLibraryPage = useMatch({ path: RouteDefinitions.MyLibraryWithTab });
  const isUserPublicPage = useMatch({ path: RouteDefinitions.UserPublicWithTab });
  const isChatPage = useMatch({ path: RouteDefinitions.Chat });

  const showSearchBar = useMemo(() => {
    return (isFromChat ||
      isPublicPromptsPage ||
      isPublicCollectionsPage ||
      isMyLibraryPage ||
      isUserPublicPage) && !isChatPage;
  }, [isFromChat, isPublicPromptsPage, isPublicCollectionsPage, isMyLibraryPage, isUserPublicPage, isChatPage]);
  return {
    showSearchBar,
    isPublicPromptsPage,
    isPublicCollectionsPage,
    isMyLibraryPage,
    isUserPublicPage,
    isChatPage,
  }
}


export default useSearchBar;

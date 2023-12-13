import Champion from '@/components/Icons/Champion';
import Fire from '@/components/Icons/Fire';
import Star from '@/components/Icons/Star';
import Latest from '@/pages/PromptList/Latest';
import MyLiked from '@/pages/PromptList/MyLiked';
import StickyTabs from '../../components/StickyTabs';
import PromptList from '../PromptList/PromptList';
import { useState, useCallback } from 'react';

export default function Prompts() {
  const [currentTab, setCurrentTab] = useState(0);
  const onChangeTab = useCallback(
    (newTab) => {
      setCurrentTab(newTab);
    },
    [],
  );
  
  const tabs = [{
    label: 'Top',
    icon: <Champion />,
    content:  <PromptList/>
  }, {
    label: 'Latest',
    icon: <Fire />,
    content:  <Latest/>
  }, {
    label: 'My liked',
    icon: <Star />,
    content:  <MyLiked/>
  }]

  return (
    <StickyTabs tabs={tabs} value={currentTab} onChangeTab={onChangeTab} />
  );
}
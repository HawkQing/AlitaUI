import React from 'react';
import BasicAccordion, { AccordionShowMode } from '@/components/BasicAccordion';
import NameDescriptionReadOnlyView from '@/components/NameDescriptionReadOnlyView';
import { useTheme } from '@emotion/react';

const ApplicationView = ({
  showProjectSelect = false,
  style,
  canEdit,
  onEdit,
  currentApplication,
}) => {
  const theme = useTheme();
  return (
    <BasicAccordion
      style={style}
      showMode={AccordionShowMode.LeftMode}
      accordionSX={{background: `${theme.palette.background.tabPanel} !important`}}
      items={[
        {
          title: 'General',
          content:
            <div>
              <NameDescriptionReadOnlyView
                icon={currentApplication?.icon}
                name={currentApplication?.name}
                onClickEdit={onEdit}
                description={currentApplication?.description}
                canEdit={canEdit}
                showProjectSelect={showProjectSelect}
                tags={currentApplication?.version_details?.tags || []}
                id={currentApplication?.id}
                idLabel='Application ID:'
                versionId={currentApplication?.version_details?.id}
                versionIdLabel='Version ID:'
              />
            </div>,
        }
      ]} />
  );
}

export default ApplicationView
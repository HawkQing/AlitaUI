import RocketIcon from '@/components/Icons/RocketIcon';
import StyledTabs from '@/components/StyledTabs';
import styled from '@emotion/styled';
import { Grid } from '@mui/material';
import ApplicationCreateForm from "./Components/Applications/ApplicationCreateForm";
import ApplicationRightContent from './Components/Applications/ApplicationRightContent';
import getValidateSchema from './Components/Applications/ApplicationCreationValidateSchema'
import { useCreateApplicationInitialValues } from './useApplicationInitialValues';
import { useState, useMemo } from 'react';
import { Form, Formik } from 'formik';
import CreateApplicationTabBar from './Components/Applications/CreateApplicationTabBar';
import ToolForm from './Components/Tools/ToolForm';
import { StyledGridContainer } from '@/pages/Prompts/Components/Common.jsx';

const TabContentDiv = styled('div')(({ theme }) => ({
  padding: `${theme.spacing(1.5)} 0`,
}))

export default function CreateApplication() {
  const [editToolDetail, setEditToolDetail] = useState(null);
  const {
    modelOptions,
    initialValues,
  } = useCreateApplicationInitialValues();

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isFullScreenChat, setIsFullScreenChat] = useState(false);
  const lgGridColumns = useMemo(
    () => {
      if (isFullScreenChat) {
        return showAdvancedSettings ? 9 : 12;
      }
      return showAdvancedSettings ? 4.5 : 6;
    },
    [isFullScreenChat, showAdvancedSettings]
  );

  return (
    <Grid container sx={{ padding: '0.5rem 0rem', position: 'fixed', marginTop: '0.7rem' }}>
      <Grid item xs={12}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={getValidateSchema}
        >
          <StyledTabs
            tabSX={{ paddingX: '24px' }}
            tabs={[{
              label: 'Run',
              icon: <RocketIcon />,
              tabBarItems: <CreateApplicationTabBar isEditingTool={!!editToolDetail}/>,
              rightToolbar: <div />,
              content:
                <TabContentDiv>
                  <Form>
                    <StyledGridContainer columnSpacing={'32px'} container sx={{ paddingX: '24px' }}>
                      <Grid item xs={12} lg={lgGridColumns}
                        hidden={isFullScreenChat}
                        // eslint-disable-next-line react/jsx-no-bind
                        sx={(theme) => ({
                          [theme.breakpoints.up('lg')]: {
                            overflowY: 'scroll',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none',
                            height: 'calc(100vh - 165px)',
                            '::-webkit-scrollbar': {
                              display: 'none',
                            }
                          },
                          [theme.breakpoints.down('lg')]: {
                            marginBottom: '24px',
                          }
                        })}>
                        {
                          editToolDetail ?
                            <ToolForm
                              editToolDetail={editToolDetail}
                              setEditToolDetail={setEditToolDetail}
                            />
                            :
                            <ApplicationCreateForm setEditToolDetail={setEditToolDetail} />
                        }
                      </Grid>
                      <ApplicationRightContent
                        modelOptions={modelOptions}
                        lgGridColumns={lgGridColumns}
                        showAdvancedSettings={showAdvancedSettings}
                        setShowAdvancedSettings={setShowAdvancedSettings}
                        isFullScreenChat={isFullScreenChat}
                        setIsFullScreenChat={setIsFullScreenChat}
                      />
                    </StyledGridContainer>
                  </Form>
                </TabContentDiv>,
            }]}
          />
        </Formik>
      </Grid>
    </Grid>
  )
}

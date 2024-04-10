/* eslint-disable no-console */
import { SearchParams, ViewMode } from '@/common/constants';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationCreateMutation } from '@/api/applications';
import RouteDefinitions from '../../../../routes';
import { useSelectedProjectId } from '../../../hooks';

const useCreateApplication = (formik) => {
  const navigate = useNavigate();
  const projectId = useSelectedProjectId();
  const [createRequest, { error, data, isLoading }] = useApplicationCreateMutation()

  const create = useCallback(
    async () => {
      await createRequest({
        projectId,
        name: formik.values.name,
        description: formik.values.description,
        type: 'interface',
        versions: [
          {
            name: 'latest',
            tags: formik.values.version_details.tags,
            instructions: formik.values.version_details.instructions,
            variables: formik.values.version_details.variables,
            tools: formik.values.version_details.tools,
            llm_settings: formik.values.version_details.llm_settings,
            conversation_starters: formik.values.version_details.conversation_starters,
          }
        ]
      })
    },
    [
      createRequest,
      projectId,
      formik.values.name,
      formik.values.description,
      formik.values.version_details.tags,
      formik.values.version_details.instructions,
      formik.values.version_details.variables,
      formik.values.version_details.tools,
      formik.values.version_details.llm_settings,
      formik.values.version_details.conversation_starters
    ]);

  useEffect(() => {
    if (error) {
      // todo: handle generic errors
      Array.isArray(error.data) ?
        error.data?.forEach(i => {
          // eslint-disable-next-line no-unused-vars
          const { ctx, loc, msg } = i
          switch (loc[0]) {
            case 'name':
              formik.setFieldError('name', msg);
              break
            case 'description':
              formik.setFieldError('description', msg);
              break
            default:
              console.warn('Unhandled error', i)
          }
        }) :
        console.error(error)
    }
  }, [error, formik])

  useEffect(() => {
    if (data) {
      const { id } = data
      formik.resetForm(data);
      const pathname = `${RouteDefinitions.MyLibrary}${RouteDefinitions.Applications}/${id}`;
      const search = `name=${encodeURIComponent(data.name)}&${SearchParams.ViewMode}=${ViewMode.Owner}`;
      data && navigate({
        pathname,
        search,
      },
        {
          replace: true,
          state: {
            routeStack: [{
              breadCrumb: formik.values.name,
              viewMode: ViewMode.Owner,
              pagePath: `${pathname}?${search}`,
            }],
          },
        })
    }
  }, [data, formik, formik.values.name, navigate]);

  return {
    isLoading,
    create,
  }
}

export default useCreateApplication;
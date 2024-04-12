import { TIME_FORMAT } from '@/common/constants';
import { timeFormatter } from '@/common/utils';
import SingleSelect from '@/components/SingleSelect';
import { StatusDot } from '@/components/StatusDot';
import { VersionAuthorAvatar } from '@/components/VersionAuthorAvatar';
import RouteDefinitions from '@/routes';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  replaceVersionInPath,
  useNameFromUrl,
  useProjectId,
  useViewModeFromUrl
} from '@/pages/hooks';
import {
  SelectLabel,
  VersionContainer,
  VersionSelectContainer,
} from '@/pages/Prompts/Components/Common';
import { useLazyGetApplicationVersionDetailQuery } from '@/api/applications';
import { alitaApi } from '../../../../api/alitaApi';
import { useDispatch } from 'react-redux';

export const buildVersionOption = enableVersionListAvatar => ({ name, id, status, created_at, author = {} }) => {
  const displayName = author.name;
  const avatar = author.avatar;
  return {
    label: name,
    value: id,
    date: timeFormatter(created_at, TIME_FORMAT.DDMMYYYY),
    icon: enableVersionListAvatar ? <VersionAuthorAvatar name={displayName} avatar={avatar} /> : <StatusDot status={status} />,
  }
}

const VersionSelect = memo(function VersionSelect({ currentVersionId = '', versions = [], enableVersionListAvatar = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname, state, search } = useLocation();
  const { applicationId, version } = useParams();
  const promptName = useNameFromUrl();
  const [getVersionDetail] = useLazyGetApplicationVersionDetailQuery();
  const viewMode = useViewModeFromUrl();
  const projectId = useProjectId();
  const currentVersion = useMemo(() => versions.find(item => item.id === currentVersionId)?.id, [currentVersionId, versions]);
  const versionSelectOptions = useMemo(() => {
    return versions.map(buildVersionOption(enableVersionListAvatar));
  }, [enableVersionListAvatar, versions]);

  const onSelectVersion = useCallback(
    (newVersion) => {
      const newPath = replaceVersionInPath(versions.find(item => item.id === newVersion)?.id, pathname, version, applicationId);
      const routeStack = [...(state?.routeStack || [])];
      if (routeStack.length) {
        routeStack[routeStack.length - 1] = {
          ...routeStack[routeStack.length - 1],
          pagePath: `${encodeURI(newPath)}?${search}`,
        }
      } else {
        routeStack.push({
          pagePath: `${encodeURI(newPath)}?${search}`,
          breadCrumb: promptName,
          viewMode,
        });
      }

      navigate(
        { pathname: encodeURI(newPath), search },
        {
          replace: true,
          state: {
            routeStack
          }
        }
      );
    },
    [versions, pathname, version, applicationId, search, state?.routeStack, navigate, promptName, viewMode],
  );

  useEffect(() => {
    const getDetail = async (versionId) => {
      const result = await getVersionDetail({ projectId, applicationId, versionId });
      dispatch(alitaApi.util.updateQueryData('applicationDetails', { applicationId, projectId }, (details) => {
        details.version_details = result.data;
      }));
    }
    if (version) {
      const versionId = versions.find(item => item.id == version)?.id;
      if (versionId) {
        getDetail(versionId);
      }
    }
  }, [getVersionDetail, projectId, applicationId, version, versions, dispatch]);

  return (
    pathname !== RouteDefinitions.CreatePrompt ?
      <>
        <VersionContainer>
          <SelectLabel variant="bodyMedium">Version</SelectLabel>
        </VersionContainer>
        <VersionSelectContainer>
          <SingleSelect
            onValueChange={onSelectVersion}
            value={currentVersion}
            options={versionSelectOptions}
            enableVersionListAvatar={enableVersionListAvatar}
            showOptionIcon
            inputSX={{
              '& .MuiSelect-select': {
                paddingRight: '8px !important',
              },
            }}
          />
        </VersionSelectContainer>
      </>
      : null
  );
});

export default VersionSelect;

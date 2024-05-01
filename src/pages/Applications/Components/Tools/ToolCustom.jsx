import { useCallback, useState, useMemo } from "react";
import ToolFormBackButton from "./ToolFormBackButton";
import CustomInput from './CustomInput';
import NormalRoundButton from '@/components/NormalRoundButton';
import useChangeFormikTools from './useChangeFormikTools';

export default function ToolCustom({
  editToolDetail = {},
  setEditToolDetail = () => { },
  handleGoBack
}) {
  const {
    settings: {
      custom_json = ''
    },
    index,
  } = editToolDetail;
  const { isAdding, onChangeTools } = useChangeFormikTools({toolIndex: index})
  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const error = useMemo(() => {
    const result = {};
    try {
      const jsonObject = JSON.parse(custom_json);
      if (Array.isArray(jsonObject)) {
        jsonObject.forEach((functionCall) => {
          if (!functionCall.name || !functionCall.description || !functionCall.settings) {
            throw 'Wrong format'
          }
        })
      } else {
        if (!jsonObject.name || !jsonObject.description || !jsonObject.settings) {
          throw 'Wrong format'
        }
      }
    } catch(_) {
      result['format'] = 'Invalid json, name, description and settings are required for every function'
    } 
    return result;
  }, [custom_json])

  const handleChange = useCallback((value) => {
    const newTool = {
      ...editToolDetail,
      settings: {
        custom_json: value,
      },
    }
    setEditToolDetail(newTool)
    onChangeTools(newTool)
    setIsDirty(true);
  }, [editToolDetail, onChangeTools, setEditToolDetail]);

  const validate = useCallback(() => {
    setIsValidating(true);
    return Object.values(error).some(item => !!item)
  }, [error]);

  const onTest = useCallback(
    () => {
      //TODO
    },
    [],
  )

  return (
    <>
      <ToolFormBackButton
        label='New custom tool'
        isAdding={isAdding}
        isDirty={isDirty}
        validate={validate}
        handleGoBack={handleGoBack}
      />
      <CustomInput
        value={custom_json}
        onValueChange={handleChange}
        error={isValidating && error.format}
        helperText={isValidating && error.format}
      />
      <NormalRoundButton sx={{ marginTop: isValidating && error.format ? '34px' : '24px' }} onClick={onTest} variant='contained' color='secondary'>
        Test
      </NormalRoundButton>
    </>
  )
}
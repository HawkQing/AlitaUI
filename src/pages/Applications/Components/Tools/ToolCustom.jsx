import { useCallback, useState, useMemo } from "react";
import ToolFormBackButton from "./ToolFormBackButton";
import CustomInput from './CustomInput';
import NormalRoundButton from '@/components/NormalRoundButton';

const parseContent = (content) => {
  let json = {};
  try {
    json = JSON.parse(content);
  } catch (_) {
    //
  }
  return json
}

export default function ToolCustom({
  editToolDetail = {},
  setEditToolDetail = () => { },
  handleGoBack
}) {
  const {
    json = '',
  } = editToolDetail;

  const [isDirty, setIsDirty] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const error = useMemo(() => {
    const result = {};
    try {
      const jsonObject = JSON.parse(json);
      if (Array.isArray(jsonObject)) {
        jsonObject.forEach((functionCall) => {
          if (!functionCall.name || !functionCall.description || !functionCall.parameters) {
            throw 'Wrong format'
          }
        })
      } else {
        if (!jsonObject.name || !jsonObject.description || !jsonObject.parameters) {
          throw 'Wrong format'
        }
      }
    } catch(_) {
      result['format'] = 'Invalid json, name, description and parameters are required for every function'
    } 
    return result;
  }, [json])

  const handleChange = useCallback((value) => {
    let parsedFunctions = []
    const result = parseContent(value)
    if (!Array.isArray(result)) {
      parsedFunctions.push(result);
    } else {
      parsedFunctions = result
    }
    setEditToolDetail({
      ...editToolDetail,
      json: value,
      functions: parsedFunctions,
    })
    setIsDirty(true);
  }, [editToolDetail, setEditToolDetail]);

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
        isDirty={isDirty}
        validate={validate}
        handleGoBack={handleGoBack}
      />
      <CustomInput
        value={json}
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
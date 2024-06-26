import { Box } from "@mui/material";
import { useCallback, useMemo } from "react";
import ToolDatasource from "./ToolDatasource";
import { ToolTypes } from "./consts";
import { useFormikContext } from "formik";
import ToolOpenAPI from './ToolOpenAPI';
import ToolCustom from './ToolCustom';
import ToolPrompt from "./ToolPrompt";


export default function ToolForm({
  editToolDetail,
  setEditToolDetail,
  sx={}
}) {
  const toolType = useMemo(() => editToolDetail?.type, [editToolDetail])
  const { setFieldValue } = useFormikContext();
  const handleGoBack = useCallback((option = {}) => {
    const { saveChanges = true } = option;
    const { index, ...toolDetail } = editToolDetail;
    if (saveChanges) {
      setFieldValue(`version_details.tools[${index}]`, toolDetail)
    }
    setEditToolDetail(null);
  }, [editToolDetail, setEditToolDetail, setFieldValue]);
  const ToolComponent = useMemo(() => {
    switch (toolType) {
      case undefined:
        return
      case ToolTypes.datasource.value:
        return ToolDatasource
      case ToolTypes.open_api.value:
        return ToolOpenAPI
      case ToolTypes.prompt.value:
        return ToolPrompt
      default:
        return ToolCustom
    }
  }, [toolType])
  return (
    <Box sx={{ padding: '12px 12px 12px 24px', ...sx}}>
      {ToolComponent && <ToolComponent
        editToolDetail={editToolDetail}
        setEditToolDetail={setEditToolDetail}
        handleGoBack={handleGoBack}
      />}
      {/*{toolType === ToolTypes.datasource.value &&*/}
      {/*  <ToolDatasource*/}
      {/*    editToolDetail={editToolDetail}*/}
      {/*    setEditToolDetail={setEditToolDetail}*/}
      {/*    handleGoBack={handleGoBack} />}*/}
      {/*{toolType === ToolTypes.open_api.value &&*/}
      {/*  <ToolOpenAPI*/}
      {/*    editToolDetail={editToolDetail}*/}
      {/*    setEditToolDetail={setEditToolDetail}*/}
      {/*    handleGoBack={handleGoBack} />}*/}
      {/*{toolType === ToolTypes.prompt.value &&*/}
      {/*  <ToolPrompt*/}
      {/*    editToolDetail={editToolDetail}*/}
      {/*    setEditToolDetail={setEditToolDetail}*/}
      {/*    handleGoBack={handleGoBack} />}*/}
      {/*{toolType === ToolTypes.custom.value &&*/}
      {/*  <ToolCustom*/}
      {/*    editToolDetail={editToolDetail}*/}
      {/*    setEditToolDetail={setEditToolDetail}*/}
      {/*    handleGoBack={handleGoBack} />}*/}
    </Box>
  )
}
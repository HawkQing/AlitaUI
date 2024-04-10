import BasicAccordion, { AccordionShowMode } from "@/components/BasicAccordion";
import { Box } from "@mui/material";
import { useFormikContext } from "formik";
import { useCallback, useMemo } from "react";
import ToolCard from "./ToolCard";
import ToolMenu from "./ToolMenu";
import { ToolInitialValues } from "./consts";

export default function ApplicationTools({ style, setEditToolDetail, containerSX, applicationId }) {
  const { values } = useFormikContext();
  const tools = useMemo(() => (values?.version_details?.tools || []), [values?.version_details?.tools])
  const onAddTool = useCallback((toolType) => () => {
    setEditToolDetail({
      ...ToolInitialValues[toolType],
      index: tools.length
    });
  }, [setEditToolDetail, tools.length])

  return (
    <BasicAccordion
      style={style}
      showMode={AccordionShowMode.LeftMode}
      items={[
        {
          title: 'Tools',
          content: (
            <Box sx={containerSX} display='flex' flexDirection='column' gap={2}>
              {tools.map((tool, index) => (
                <ToolCard key={index} tool={tool} index={index} setEditToolDetail={setEditToolDetail} applicationId={applicationId}/>
              ))}
              <ToolMenu onAddTool={onAddTool} />
            </Box>
          ),
        },
      ]} />
  )
}
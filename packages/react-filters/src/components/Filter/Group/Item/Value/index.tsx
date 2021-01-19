import { Checkbox, TextField } from "@material-ui/core";
import React, { useContext } from "react";
import { NotionFilterContext } from "../../../../../NotionFilter";
import { TFilterItemValue } from "../../../../../types";
import TagsAutocomplete from "../../../../Shared/TagsAutocomplete";

interface Props {
  value: TFilterItemValue
}

export default function FilterGroupItemValue(props: Props) {
  let child: any = null;
  const { filter_item_label } = useContext(NotionFilterContext)
  if (Array.isArray(props.value)) {
    return <TagsAutocomplete label={""} value={""} onChange={() => { }} options={props.value} />
  }

  switch (props.value) {
    case "checkbox":
      return <Checkbox
        checked={false}
        onChange={() => { }}
      />
    case "string":
      return <TextField label={filter_item_label && "Value"} placeholder="Value" variant="outlined" />
    case "number":
      return <TextField label={filter_item_label && "Value"} type="number" placeholder="Value" variant="outlined" />
  }

  return <div className="NotionFilter-Group-Item-Value">{child}</div>
}
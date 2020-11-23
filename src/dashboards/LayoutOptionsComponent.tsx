import React from "react"
import { useState } from "react"
import { FormGroup, Toggle } from "react-library/lib/bootstrap"
import { DashboardDesign } from "./DashboardDesign"
import { BlocksLayoutOptions, getDefaultLayoutOptions, getLayoutOptions, sampleWidthsByBucket, WidthBucket } from "./layoutOptions"

export function LayoutOptionsComponent(props: {
  design: DashboardDesign
  onDesignChange: (design: DashboardDesign) => void
  onClose: () => void,
  children: any
}) {
  const [bucket, setBucket] = useState<WidthBucket>("lg")

  const layoutOptions = getLayoutOptions(props.design)

  function setLayoutOptions(layoutOptions: BlocksLayoutOptions) {
    props.onDesignChange({ ...props.design, layoutOptions })
  }
  
  return <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", height: "100%" }}>
    <div style={{ padding: 5 }}>
      <div key="back">
        <button className="btn btn-xs btn-link" onClick={props.onClose}>
          <i className="fa fa-arrow-left"/> Close
        </button>
      </div>
      <br/>
      <FormGroup label="Preview As" key="preview">
        <Toggle 
          value={bucket}
          onChange={setBucket}
          size="xs"
          options={[
            { value: "sm", label: "Phone" },
            { value: "md", label: "Tablet" },
            { value: "lg", label: "Laptop" },
            { value: "xl", label: "Desktop" },
          ]}
        />
      </FormGroup>
      <ThemeToggle
        theme={props.design.style}
        onChange={theme => { props.onDesignChange({ ...props.design, style: theme, layoutOptions: getDefaultLayoutOptions(theme) })}}
        />
      <FormGroup label="Collapse to Single Column">
        <Toggle 
          value={layoutOptions.collapseColumns}
          onChange={collapseColumns => { setLayoutOptions({ ...layoutOptions, collapseColumns: collapseColumns as WidthBucket | null })}}
          size="xs"
          options={[
            { value: null, label: "Never" },
            { value: "sm", label: "Phone" },
            { value: "md", label: "Tablet" },
            { value: "lg", label: "Laptop" },
          ]}
        />
      </FormGroup>
    </div>
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: `1fr ${sampleWidthsByBucket[bucket]}px 1fr`, height: "100%", border: "solid 1px #AAA" }}>
        <div style={{ backgroundColor: "#888" }}></div>
        {props.children}
        <div style={{ backgroundColor: "#888" }}></div>
      </div>
    </div>
  </div>
}

function ThemeToggle(props: {
  theme?: string
  onChange: (theme: string) => void
}) {
  function renderStyleItem(theme: string) {
    const isActive = (props.theme || "default") == theme

    if (theme == "default") {
      return <a key={theme} className={isActive ? "list-group-item active" : "list-group-item"} onClick={props.onChange.bind(null, "default")}>
        <div>Classic Dashboard</div>
        <div style={{ opacity: 0.6 }}>Ideal for data display with minimal text</div>
      </a>
    }
    if (theme == "greybg") {
      return <a key={theme} className={isActive ? "list-group-item active" : "list-group-item"} onClick={props.onChange.bind(null, "greybg")}>
        <div>Framed Dashboard</div>
        <div style={{ opacity: 0.6 }}>Each widget is white on a grey background</div>
      </a>
    }
    if (theme == "story") {
      return <a key={theme} className={isActive ? "list-group-item active" : "list-group-item"} onClick={props.onChange.bind(null, "story")}>
        <div>Story</div>
        <div style={{ opacity: 0.6 }}>Ideal for data-driven storytelling with lots of text</div>
      </a>
    }
    return null
  }

  return <FormGroup label="Theme">
    {renderStyleItem("default")}
    {renderStyleItem("greybg")}
    {renderStyleItem("story")}
  </FormGroup>
}
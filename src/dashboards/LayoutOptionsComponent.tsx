import React, { ReactNode } from "react"
import { useState } from "react"
import { FormGroup, Select, Toggle } from "react-library/lib/bootstrap"
import { DashboardDesign } from "./DashboardDesign"
import { BlocksLayoutOptions, DashboardTheme, getDefaultLayoutOptions, getLayoutOptions, WidthBucket } from "./layoutOptions"

interface Size { 
  width: number
  height: number
}

const sizeOptions: { value: Size, label: string }[] = [
  { value: { width: 360, height: 640 }, label: "Phone (360x640)" },
  { value: { width: 768, height: 1024 }, label: "Tablet (768x1024)" },
  { value: { width: 1000, height: 800 }, label: "Laptop (1000x800)" },
  { value: { width: 1280, height: 1024 }, label: "Desktop (1280x1024)" },
]

export function LayoutOptionsComponent(props: {
  design: DashboardDesign
  onDesignChange: (design: DashboardDesign) => void
  onClose: () => void,

  /** Dashboard view to preview*/
  dashboardView: ReactNode

  /** Quickfilters to preview */
  quickfiltersView: ReactNode
}) {
  const [previewSize, setPreviewSize] = useState(2)
  const layoutOptions = getLayoutOptions(props.design)

  function setLayoutOptions(layoutOptions: BlocksLayoutOptions) {
    props.onDesignChange({ ...props.design, layoutOptions })
  }

  function handleResetDefaults() {
    props.onDesignChange({ ...props.design, layoutOptions: getDefaultLayoutOptions(props.design.style) })
  }
  
  return <div style={{ display: "grid", gridTemplateRows: "auto 1fr", gridTemplateColumns: "auto 1fr", height: "100%" }}>
    <div style={{ padding: 5, gridRow: "1 / 3" }}>
      <div key="back">
        <button className="btn btn-xs btn-link" onClick={props.onClose}>
          <i className="fa fa-arrow-left"/> Close
        </button>
      </div>
      <br/>
      <ThemeToggle
        theme={props.design.style}
        onChange={theme => { props.onDesignChange({ ...props.design, style: theme, layoutOptions: getDefaultLayoutOptions(theme) })}}
        />
      <br/>
      <h4>Advanced</h4>
      <a className="btn btn-xs btn-link" style={{ float: "right" }} onClick={handleResetDefaults}>
        Reset to Defaults
      </a>
      <FormGroup label="Collapse to Single Column">
        <WidthSelector
          value={layoutOptions.collapseColumnsWidth}
          onChange={collapseColumnsWidth => { setLayoutOptions({ ...layoutOptions, collapseColumnsWidth })}}
          sign="< "
        />
      </FormGroup>
      <FormGroup label="Hide Quickfilters">
        <WidthSelector
          value={layoutOptions.hideQuickfiltersWidth}
          onChange={hideQuickfiltersWidth => { setLayoutOptions({ ...layoutOptions, hideQuickfiltersWidth })}}
          sign="< "
        />
      </FormGroup>
      <FormGroup label="Minimum Width (before scrolling or scaling)">
        <WidthSelector
          value={layoutOptions.minimumWidth}
          onChange={minimumWidth => { setLayoutOptions({ ...layoutOptions, minimumWidth })}}
          sign="< "
        />      
        <FormGroup label="When Below Minimum Width">
          <Toggle
            value={layoutOptions.belowMinimumWidth}
            onChange={belowMinimumWidth => { setLayoutOptions({ ...layoutOptions, belowMinimumWidth: belowMinimumWidth as "scale" | "scroll" })}}
            options={[
              { value: "scroll", label: "Scroll" },
              { value: "scale", label: "Scale" },
            ]}
          />
      </FormGroup>

      </FormGroup>
      <FormGroup label="Maximum Width (before padding)">
        <WidthSelector
          value={layoutOptions.maximumWidth}
          onChange={maximumWidth => { setLayoutOptions({ ...layoutOptions, maximumWidth })}}
          sign="> "
        />
      </FormGroup>
    </div>
    <div style={{ textAlign: "center", padding: 3 }}>
      <span className="text-muted">Preview As:&nbsp;</span>
      <Toggle 
        value={previewSize}
        onChange={setPreviewSize}
        size="xs"
        options={sizeOptions.map((so, index) => ({ value: index, label: so.label }))}
      />
    </div>
    <div style={{ overflow: "auto" }}>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: `1fr ${sizeOptions[previewSize].value.width}px 1fr`, 
        gridTemplateRows: `1fr ${sizeOptions[previewSize].value.height}px 1fr`, 
        height: "100%", 
        border: "solid 1px #AAA" 
      }}>
        <div style={{ backgroundColor: "#888", gridColumn: "1 / 4" }}></div>
        <div style={{ backgroundColor: "#888" }}></div>
        <div style={{ height: "100%", display: "grid", gridTemplateRows: "auto 1fr" }}>
          {
            layoutOptions.hideQuickfiltersWidth == null || sizeOptions[previewSize].value.width > layoutOptions.hideQuickfiltersWidth ?
              props.quickfiltersView
            : <div/>
          }
          {props.dashboardView}
        </div>
        <div style={{ backgroundColor: "#888" }}></div>
        <div style={{ backgroundColor: "#888", gridColumn: "1 / 4" }}></div>
      </div>
    </div>
  </div>
}

function ThemeToggle(props: {
  theme?: DashboardTheme
  onChange: (theme: DashboardTheme) => void
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

function WidthSelector(props: {
  value: number | null
  onChange: (value: number | null) => void
  /** E.g. >=, <= */
  sign: string
}) {
  return <Select
    value={props.value}
    onChange={props.onChange}
    nullLabel="N/A"
    options={[
      { value: 400, label: `${props.sign}400px (Phone)` },
      { value: 600, label: `${props.sign}600px (Small tablet)` },
      { value: 800, label: `${props.sign}800px (Tablet)` },
      { value: 1000, label: `${props.sign}1000px (Laptop)` },
      { value: 1200, label: `${props.sign}1200px (Desktop)` },
      { value: 1600, label: `${props.sign}1600px (Wide Desktop)` }
    ]} />
}
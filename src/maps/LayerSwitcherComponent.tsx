import produce from "immer"
import React, { CSSProperties, Ref, useEffect, useRef, useState } from "react"
import { MapDesign, MapLayerView } from "./MapDesign"

/** Component to switch layers on a map */
export function LayerSwitcherComponent(props: { design: MapDesign; onDesignChange: (design: MapDesign) => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const iconStyle: CSSProperties = {
    backgroundColor: "white",
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 3,
    paddingBottom: 3,
    borderRadius: 4,
    border: "solid 1px #AAA",
    color: "#666",
    position: "absolute",
    right: 0,
    top: 0,
    cursor: "pointer",
    fontSize: 14
  }

  function toggleDropdown() {
    setDropdownOpen((ddo) => !ddo)
  }

  function renderLayerView(lv: MapLayerView, index: number) {
    function handleClick() {
      props.onDesignChange(
        produce(props.design, (draft) => {
          draft.layerViews[index].visible = !lv.visible

          // Unselect any in same group if selected
          if (lv.group && !lv.visible) {
            draft.layerViews.forEach((lv2, i) => {
              if (lv2.visible && i != index && lv2.group == lv.group) {
                lv2.visible = false
              }
            })
          }
        })
      )
    }

    return (
      <div key={index} style={{ fontSize: 12, whiteSpace: "nowrap", cursor: "pointer" }} onClick={handleClick}>
        <i className={lv.visible ? "fa fa-fw fa-check-square text-primary" : "fa fa-fw fa-square text-muted"} />
        &nbsp;{lv.name}
      </div>
    )
  }

  return (
    <div
      style={{ position: "absolute", top: 20, right: 20, zIndex: 1000, userSelect: "none" }}
      ref={useClickOutside(() => {
        setDropdownOpen(false)
      })}
    >
      <div style={iconStyle} onClick={toggleDropdown}>
        <i className="fas fa-layer-group fa-fw" />
      </div>
      {dropdownOpen ? (
        <div style={{ backgroundColor: "white", position: "absolute", top: 28, right: 0, padding: 5 }}>
          {props.design.layerViews.map(renderLayerView)}
        </div>
      ) : null}
    </div>
  )
}

/** Hook for click outside catching */
function useClickOutside(onClickOut: () => void): Ref<HTMLDivElement> {
  const node = useRef<HTMLDivElement>(null)

  const handleClick = (e: MouseEvent) => {
    const nodeRef = node.current
    // If inside click
    if (nodeRef && nodeRef.contains(e.target as any)) {
      return
    }
    // If outside click
    onClickOut()
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClick)
    return () => {
      document.removeEventListener("mousedown", handleClick)
    }
  }, [])

  return node
}

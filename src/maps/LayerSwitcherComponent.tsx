import React from "react";
import { MapDesign } from "./MapDesign";


/** Component to switch layers on a map */
export function LayerSwitcherComponent(props: {
  design: MapDesign
  onDesignChange: (design: MapDesign) => void
}) {
  return <div>
    <i className="fas fa-layer-group"/>
  </div>
}


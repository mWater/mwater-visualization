/// <reference types="react" />
import { MapDesign } from "./MapDesign";
/** Component to switch layers on a map */
export declare function LayerSwitcherComponent(props: {
    design: MapDesign;
    onDesignChange: (design: MapDesign) => void;
}): JSX.Element;

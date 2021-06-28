import React from "react";
import { JsonQLFilter } from "../index";
import { SwitchableTileUrlLayerDesign } from "./SwitchableTileUrlLayer";
/** Designer for a switchable tile url layer */
export default class SwitchableTileUrlLayerDesigner extends React.Component<{
    design: SwitchableTileUrlLayerDesign;
    onDesignChange: (design: SwitchableTileUrlLayerDesign) => void;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters: JsonQLFilter[];
}> {
    update(mutation: (d: SwitchableTileUrlLayerDesign) => void): void;
    handleChange: (activeOption: string) => void;
    render(): JSX.Element;
}

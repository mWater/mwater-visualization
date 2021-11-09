/// <reference types="jquery" />
import Layer from "./Layer";
import React from "react";
import { Schema } from "mwater-expressions";
export default class MWaterServerLayer extends Layer<any> {
    onGridClick(ev: any, options: any): {
        row: {
            tableId: any;
            primaryKey: any;
        };
    } | null;
    getMinZoom(design: any): any;
    getMaxZoom(design: any): any;
    getLegend(design: any, schema: Schema): React.CElement<any, LoadingLegend>;
    getFilterableTables(design: any, schema: Schema): any[];
    isEditable(): boolean;
    cleanDesign(design: any, schema: Schema): any;
    validateDesign(design: any, schema: Schema): null;
}
interface LoadingLegendProps {
    url?: string;
}
interface LoadingLegendState {
    html: any;
}
declare class LoadingLegend extends React.Component<LoadingLegendProps, LoadingLegendState> {
    constructor(props: any);
    componentDidMount(): JQuery.jqXHR<any>;
    componentWillReceiveProps(nextProps: any): JQuery.jqXHR<any> | undefined;
    render(): React.DetailedReactHTMLElement<{
        style: {
            font: "14px/16px Arial, Helvetica, sans-serif";
            color: "#555";
        };
        dangerouslySetInnerHTML: {
            __html: any;
        };
    }, HTMLElement>;
}
export {};

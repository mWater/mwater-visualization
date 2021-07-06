import React from "react";
import LayoutManager from "../LayoutManager";
export default class GridLayoutManager extends LayoutManager {
    renderPalette(width: any): React.DetailedReactHTMLElement<{
        className: string;
        style: {
            position: "absolute";
            top: number;
            left: number;
            bottom: number;
            width: number;
        };
    }, HTMLElement>;
    renderLayout(options: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    isEmpty(items: any): boolean;
    getWidgetTypeAndDesign(items: any, widgetId: any): any;
    getAllWidgets(items: any): {
        id: string;
        type: any;
        design: any;
    }[];
    addWidget(items: any, widgetType: any, widgetDesign: any): any;
    findOpenLayout(items: any, width: any, height: any): {
        x: number;
        y: number;
        w: any;
        h: any;
    };
}

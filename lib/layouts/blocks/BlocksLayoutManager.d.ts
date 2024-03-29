import React from "react";
import LayoutManager from "../LayoutManager";
export default class BlocksLayoutManager extends LayoutManager {
    renderLayout(options: any): React.CElement<{
        items: any;
        onItemsChange: any;
        style: any;
        layoutOptions: any;
        renderWidget: any;
        disableMaps: any;
        clipboard: any;
        onClipboardChange: any;
        cantPasteMessage: any;
    }, React.Component<{
        items: any;
        onItemsChange: any;
        style: any;
        layoutOptions: any;
        renderWidget: any;
        disableMaps: any;
        clipboard: any;
        onClipboardChange: any;
        cantPasteMessage: any;
    }, any, any>>;
    isEmpty(items: any): boolean;
    getWidgetTypeAndDesign(items: any, widgetId: any): {
        type: string;
        design: any;
    } | null;
    getAllWidgets(items: any): {
        id: string;
        type: string;
        design: any;
    }[];
    addWidget(items: any, widgetType: any, widgetDesign: any): any;
}

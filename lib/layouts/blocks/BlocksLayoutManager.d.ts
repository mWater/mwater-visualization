import React from "react";
declare const _default: {
    new (): {
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
        getWidgetTypeAndDesign(items: any, widgetId: any): any;
        getAllWidgets(items: any): any;
        addWidget(items: any, widgetType: any, widgetDesign: any): any;
    };
    createLayoutManager(type: any): any;
};
export default _default;

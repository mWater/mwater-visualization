import { ReactElement, ReactNode } from "react";
import { BlocksLayoutOptions } from "../dashboards/layoutOptions";
/** Responsible for laying out items, rendering widgets and holding them in a data structure that is layout manager specific */
export default class LayoutManager {
    /** Renders the layout as a react element */
    renderLayout(options: {
        /** width of layout */
        width?: number;
        /** opaque items object that layout manager understands */
        items: any;
        /** Called when items changes */
        onItemsChange?: (items: any) => void;
        /** called with ({ id:, type:, design:, onDesignChange:, width:, height:  }) */
        renderWidget: (options: {
            id: string;
            type: string;
            design: any;
            onDesignChange: (design: any) => void;
            width: number;
            height: number;
        }) => ReactElement;
        /** style to use for layout. null for default */
        style: string | null;
        /** layout options to use */
        layoutOptions: BlocksLayoutOptions | null;
        /** true to disable maps */
        disableMaps?: boolean;
        /** clipboard contents */
        clipboard: any;
        /** called when clipboard is changed */
        onClipboardChange: (clipboard: any) => void;
        /** message to display if clipboard can't be pasted into current dashboard */
        cantPasteMessage: string;
    }): ReactNode;
    /** Tests if dashboard has any items */
    isEmpty(items: any): boolean;
    /** Gets { type, design } of a widget */
    getWidgetTypeAndDesign(items: any, widgetId: string): {
        type: string;
        design: any;
    };
    /** Gets all widgets in items as array of { id, type, design } */
    getAllWidgets(items: any): {
        id: string;
        type: string;
        design: any;
    }[];
    static createLayoutManager(type: string): LayoutManager;
    addWidget(items: any, widgetType: string, widgetDesign: any): any;
}

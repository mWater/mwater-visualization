import PropTypes from "prop-types";
import React from "react";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
declare const _default: {
    new (): {
        createViewElement(options: any): React.CElement<any, TOCWidgetComponent>;
        isAutoHeight(): boolean;
        getData(design: any, schema: any, dataSource: any, filters: any, callback: any): void;
        getFilterableTables(design: any, schema: any): never[];
        getTOCEntries(design: any, namedStrings: any): never[];
    };
};
export default _default;
declare class TOCWidgetComponent extends React.Component {
    static propTypes: {
        design: PropTypes.Validator<object>;
        onDesignChange: PropTypes.Requireable<(...args: any[]) => any>;
        width: PropTypes.Requireable<number>;
        height: PropTypes.Requireable<number>;
        tocEntries: PropTypes.Requireable<(PropTypes.InferProps<{
            id: PropTypes.Requireable<any>;
            widgetId: PropTypes.Validator<string>;
            level: PropTypes.Validator<number>;
            text: PropTypes.Validator<string>;
        }> | null | undefined)[]>;
        onScrollToTOCEntry: PropTypes.Requireable<(...args: any[]) => any>;
    };
    constructor(props: any);
    handleStartEditing: () => void;
    handleEndEditing: () => void;
    renderEditor(): React.CElement<{
        header?: React.ReactNode;
        footer?: React.ReactNode;
        size?: "small" | "normal" | "full" | "large" | undefined;
        width?: number | undefined;
        showCloseX?: boolean | undefined;
        onClose?: (() => void) | undefined;
    }, ModalPopupComponent> | null;
    renderContent(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    render(): React.DetailedReactHTMLElement<{
        onDoubleClick: () => void;
    }, HTMLElement>;
}

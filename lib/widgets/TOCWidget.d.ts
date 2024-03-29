import PropTypes from "prop-types";
import React from "react";
import Widget, { CreateViewElementOptions } from "./Widget";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
export default class TOCWidget extends Widget {
    createViewElement(options: CreateViewElementOptions): React.CElement<any, TOCWidgetComponent>;
    isAutoHeight(): boolean;
}
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
    renderEditor(): React.CElement<import("react-library/lib/ModalPopupComponent").ModalPopupComponentProps, ModalPopupComponent> | null;
    renderContent(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    render(): React.DetailedReactHTMLElement<{
        onDoubleClick: () => void;
    }, HTMLElement>;
}
export {};

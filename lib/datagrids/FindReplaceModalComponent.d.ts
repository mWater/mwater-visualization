import PropTypes from "prop-types";
import React from "react";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
export default class FindReplaceModalComponent extends React.Component {
    static propTypes: {
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        design: PropTypes.Validator<object>;
        filters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
        canEditValue: PropTypes.Requireable<(...args: any[]) => any>;
        updateValue: PropTypes.Requireable<(...args: any[]) => any>;
        onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
    };
    constructor(props: any);
    show(): void;
    performReplace(): any;
    renderPreview(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    renderContents(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    render(): React.CElement<any, ModalPopupComponent> | null;
}

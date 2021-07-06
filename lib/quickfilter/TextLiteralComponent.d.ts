import PropTypes from "prop-types";
import React from "react";
import { default as AsyncReactSelect } from "react-select/async";
export default class TextLiteralComponent extends React.Component {
    static propTypes: {
        value: PropTypes.Requireable<any>;
        onChange: PropTypes.Requireable<(...args: any[]) => any>;
        schema: PropTypes.Validator<object>;
        quickfiltersDataSource: PropTypes.Validator<object>;
        expr: PropTypes.Validator<object>;
        index: PropTypes.Validator<number>;
        multi: PropTypes.Requireable<boolean>;
        filters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
    };
    handleSingleChange: (val: any) => any;
    handleMultipleChange: (val: any) => any;
    getOptions: (input: any, cb: any) => void;
    renderSingle(): React.CElement<import("react-select/async").Props<import("react-select").OptionTypeBase, boolean>, AsyncReactSelect<import("react-select").OptionTypeBase, boolean>>;
    renderMultiple(): React.CElement<import("react-select/async").Props<import("react-select").OptionTypeBase, boolean>, AsyncReactSelect<import("react-select").OptionTypeBase, boolean>>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
        };
    }, HTMLElement>;
}

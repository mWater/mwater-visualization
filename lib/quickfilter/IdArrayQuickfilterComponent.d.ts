import PropTypes from "prop-types";
import React from "react";
export default class IdArrayQuickfilterComponent extends React.Component {
    static propTypes: {
        label: PropTypes.Validator<string>;
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        expr: PropTypes.Validator<object>;
        index: PropTypes.Validator<number>;
        value: PropTypes.Requireable<any>;
        onValueChange: PropTypes.Requireable<(...args: any[]) => any>;
        multi: PropTypes.Requireable<boolean>;
        filters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
    };
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "inline-block";
            paddingRight: number;
        };
    }, HTMLElement>;
}

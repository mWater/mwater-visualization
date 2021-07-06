import PropTypes from "prop-types";
import React from "react";
export default class QuickfiltersComponent extends React.Component {
    static propTypes: {
        design: PropTypes.Requireable<(PropTypes.InferProps<{
            expr: PropTypes.Validator<object>;
            label: PropTypes.Requireable<string>;
        }> | null | undefined)[]>;
        values: PropTypes.Requireable<any[]>;
        onValuesChange: PropTypes.Validator<(...args: any[]) => any>;
        locks: PropTypes.Requireable<(PropTypes.InferProps<{
            expr: PropTypes.Validator<object>;
            value: PropTypes.Requireable<any>;
        }> | null | undefined)[]>;
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        quickfiltersDataSource: PropTypes.Validator<object>;
        filters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
        hideTopBorder: PropTypes.Requireable<boolean>;
        onHide: PropTypes.Requireable<(...args: any[]) => any>;
    };
    renderQuickfilter(item: any, index: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null | undefined;
    render(): React.DetailedReactHTMLElement<{
        style: {
            borderTop: string | undefined;
            borderBottom: string;
            padding: number;
        };
    }, HTMLElement> | null;
}

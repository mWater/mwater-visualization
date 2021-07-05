import PropTypes from "prop-types";
import React from "react";
declare const _default: {
    new (props: {} | Readonly<{}>): {
        renderQuickfilter(item: any, index: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null | undefined;
        render(): React.DetailedReactHTMLElement<{
            style: {
                borderTop: string | undefined;
                borderBottom: string;
                padding: number;
            };
        }, HTMLElement> | null;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<{}> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
    };
    new (props: {}, context: any): {
        renderQuickfilter(item: any, index: any): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | null | undefined;
        render(): React.DetailedReactHTMLElement<{
            style: {
                borderTop: string | undefined;
                borderBottom: string;
                padding: number;
            };
        }, HTMLElement> | null;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<{}> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
    };
    propTypes: {
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
    contextType?: React.Context<any> | undefined;
};
export default _default;

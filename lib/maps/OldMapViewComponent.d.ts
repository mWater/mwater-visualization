import PropTypes from "prop-types";
import React from "react";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
declare const _default: {
    new (props: any): {
        componentDidMount(): any;
        componentDidUpdate(prevProps: any): any;
        performAutoZoom(): any;
        handleBoundsChange: (bounds: any) => any;
        handleGridClick: (layerViewId: any, ev: any) => any;
        getCompiledFilters(): any;
        renderLegend(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
        renderPopup(): React.CElement<{
            header?: React.ReactNode;
            footer?: React.ReactNode;
            size?: "small" | "normal" | "full" | "large" | undefined;
            width?: number | undefined;
            showCloseX?: boolean | undefined;
            onClose?: (() => void) | undefined;
        }, ModalPopupComponent> | null;
        render(): React.DetailedReactHTMLElement<{
            style: {
                width: any;
                height: any;
                position: "relative";
            };
        }, HTMLElement>;
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
        shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
    };
    propTypes: {
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        mapDataSource: PropTypes.Validator<PropTypes.InferProps<{
            getLayerDataSource: PropTypes.Validator<(...args: any[]) => any>;
            getBounds: PropTypes.Validator<(...args: any[]) => any>;
        }>>;
        design: PropTypes.Validator<object>;
        onDesignChange: PropTypes.Requireable<(...args: any[]) => any>;
        width: PropTypes.Requireable<number>;
        height: PropTypes.Requireable<number>;
        onRowClick: PropTypes.Requireable<(...args: any[]) => any>;
        extraFilters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
        scope: PropTypes.Requireable<PropTypes.InferProps<{
            name: PropTypes.Validator<string>;
            filter: PropTypes.Requireable<PropTypes.InferProps<{
                table: PropTypes.Validator<string>;
                jsonql: PropTypes.Validator<object>;
            }>>;
            data: PropTypes.Validator<PropTypes.InferProps<{
                layerViewId: PropTypes.Validator<string>;
                data: PropTypes.Requireable<any>;
            }>>;
        }>>;
        onScopeChange: PropTypes.Requireable<(...args: any[]) => any>;
        dragging: PropTypes.Requireable<boolean>;
        touchZoom: PropTypes.Requireable<boolean>;
        scrollWheelZoom: PropTypes.Requireable<boolean>;
        zoomLocked: PropTypes.Requireable<boolean>;
    };
    contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    contextType?: React.Context<any> | undefined;
};
export default _default;

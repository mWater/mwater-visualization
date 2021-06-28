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
    initClass(): void;
    contextType?: React.Context<any> | undefined;
};
export default _default;

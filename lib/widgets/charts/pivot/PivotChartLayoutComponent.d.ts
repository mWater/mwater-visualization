import React from "react";
declare const _default: {
    new (props: any): {
        recordCellComp: (rowIndex: any, columnIndex: any, comp: any) => any;
        renderRow(row: any, rowIndex: any): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        renderHoverPlusIcon: (key: any, x: any, y: any, onClick: any) => React.DetailedReactHTMLElement<{
            key: any;
            onClick: any;
            style: {
                position: "absolute";
                left: number;
                top: number;
                border: string;
                backgroundColor: "white";
                paddingLeft: number;
                paddingRight: number;
                paddingTop: number;
                color: "#337ab7";
                fontSize: number;
                cursor: "pointer";
                opacity: number;
            };
        }, HTMLElement>;
        renderHoverRemoveIcon: (key: any, x: any, y: any, onClick: any) => React.DetailedReactHTMLElement<{
            key: any;
            onClick: any;
            style: {
                position: "absolute";
                left: number;
                top: number;
                border: string;
                backgroundColor: "white";
                paddingLeft: number;
                paddingRight: number;
                paddingTop: number;
                color: "#337ab7";
                fontSize: number;
                cursor: "pointer";
                opacity: number;
            };
        }, HTMLElement>;
        renderHoverControls: () => React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | null | undefined;
        render(): React.DetailedReactHTMLElement<{
            style: {
                position: "relative";
            };
            onMouseLeave: () => void;
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
    initClass(): void;
    contextType?: React.Context<any> | undefined;
};
export default _default;

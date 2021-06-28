import React from "react";
declare const _default: {
    new (props: any): {
        getChildContext(): {
            locale: any;
            activeTables: string[];
        };
        getQuickfilterValues: () => any;
        componentWillReceiveProps(nextProps: any): void;
        handlePrint: () => any;
        handleUndo: () => void;
        handleRedo: () => void;
        handleSaveDesignFile: () => any;
        handleSettings: () => any;
        handleToggleEditing: () => void;
        handleOpenLayoutOptions: () => void;
        handleRefreshData: () => void;
        handleStyleChange: (style: any) => any;
        handleDesignChange: (design: any) => any;
        handleShowQuickfilters: () => void;
        handleUpgrade: () => void;
        getCompiledFilters(): {
            table: string;
            jsonql: string | number | true | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken;
        }[];
        renderEditingSwitch(): React.DetailedReactHTMLElement<{
            key: string;
            className: string;
            onClick: () => void;
        }, HTMLElement>;
        renderStyleItem(style: any): React.DetailedReactHTMLElement<{
            key: any;
            className: string;
            onClick: any;
        }, HTMLElement>;
        renderStyle(): React.DetailedReactHTMLElement<{
            type: string;
            key: string;
            className: string;
            onClick: () => void;
        }, HTMLElement>;
        renderActionLinks(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        renderTitleBar(): React.DetailedReactHTMLElement<{
            style: {
                height: number;
                padding: number;
            };
        }, HTMLElement>;
        renderQuickfilter(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
        refDashboardView: (el: any) => any;
        render(): React.DetailedReactHTMLElement<{
            style: {
                display: "grid";
                gridTemplateRows: string;
                height: string;
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
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
    };
    initClass(): void;
    contextType?: React.Context<any> | undefined;
};
export default _default;

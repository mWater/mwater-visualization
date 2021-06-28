import React from "react";
declare const _default: {
    new (props: {} | Readonly<{}>): {
        createItemsHtmlConverter(): {
            convertSpecialItemToHtml(item: any): string;
            convertElemToItems(elem: any): any;
            convertItemsToHtml(items: any): string;
        };
        handleItemsChange: (items: any) => any;
        handleInsertExpr: (item: any) => any;
        replaceItem(item: any): any;
        handleItemClick: (item: any) => any;
        handleAddExpr: (ev: any) => any;
        renderExtraPaletteButtons(): React.DetailedReactHTMLElement<{
            key: string;
            className: string;
            onMouseDown: (ev: any) => any;
        }, HTMLElement>;
        renderModals(): React.CElement<any, any>[];
        refRichTextComponent: (c: any) => any;
        render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
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
        createItemsHtmlConverter(): {
            convertSpecialItemToHtml(item: any): string;
            convertElemToItems(elem: any): any;
            convertItemsToHtml(items: any): string;
        };
        handleItemsChange: (items: any) => any;
        handleInsertExpr: (item: any) => any;
        replaceItem(item: any): any;
        handleItemClick: (item: any) => any;
        handleAddExpr: (ev: any) => any;
        renderExtraPaletteButtons(): React.DetailedReactHTMLElement<{
            key: string;
            className: string;
            onMouseDown: (ev: any) => any;
        }, HTMLElement>;
        renderModals(): React.CElement<any, any>[];
        refRichTextComponent: (c: any) => any;
        render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
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

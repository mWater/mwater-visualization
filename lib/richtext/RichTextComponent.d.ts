import React from "react";
declare const _default: {
    new (props: any): {
        handleClick: (ev: any) => void;
        pasteHTML(html: any): any;
        focus(): any;
        handleInsertExpr: (item: any) => any;
        handleSetFontSize: (size: any) => any;
        handleSetFontColor: (color: any) => boolean | void;
        handleChange: (elem: any) => any;
        handleFocus: () => void;
        handleBlur: () => void;
        handleCommand: (command: any, param: any, ev: any) => boolean;
        handleCreateLink: (ev: any) => boolean | undefined;
        handleEditorClick: (ev: any) => any;
        createHtml(): any;
        renderPalette(): React.CElement<{
            style: {
                zIndex: number;
            };
            edges: string;
            align: string;
            render: (schemeName: any, { edges }: any) => React.DetailedReactHTMLElement<{
                key: string;
                className: string;
                ref: (c: HTMLElement | null) => HTMLElement | null;
            }, HTMLElement>;
        }, React.Component<{
            style: {
                zIndex: number;
            };
            edges: string;
            align: string;
            render: (schemeName: any, { edges }: any) => React.DetailedReactHTMLElement<{
                key: string;
                className: string;
                ref: (c: HTMLElement | null) => HTMLElement | null;
            }, HTMLElement>;
        }, any, any>>;
        renderPaletteContent: (schemeName: any, { edges }: any) => React.DetailedReactHTMLElement<{
            key: string;
            className: string;
            ref: (c: HTMLElement | null) => HTMLElement | null;
        }, HTMLElement>;
        refContentEditable: (c: any) => any;
        renderHtml(): React.DetailedReactHTMLElement<{
            key: string;
            style: any;
            className: any;
        }, HTMLElement>;
        render(): React.DetailedReactHTMLElement<{
            style: {
                position: "relative";
            };
            ref: (c: HTMLElement | null) => HTMLElement | null;
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

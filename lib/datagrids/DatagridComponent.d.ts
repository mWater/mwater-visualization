import React from "react";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
declare const _default: {
    new (props: any): {
        reload(): any;
        componentDidMount(): void;
        componentDidUpdate(): void;
        updateHeight(): void;
        getQuickfilterValues: () => any;
        getQuickfilterFilters: () => {
            table: any;
            jsonql: string | number | boolean | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken;
        }[];
        handleCellEditingToggle: () => void;
        handleEdit: () => void;
        getCompiledFilters(): {
            table: any;
            jsonql: string | number | true | import("jsonql").JsonQLLiteral | import("jsonql").JsonQLOp | import("jsonql").JsonQLCase | import("jsonql").JsonQLScalar | import("jsonql").JsonQLField | import("jsonql").JsonQLToken;
        }[];
        renderCellEdit(): React.DetailedReactHTMLElement<{
            key: string;
            className: string;
            onClick: () => void;
        }, HTMLElement> | null;
        renderEditButton(): React.DetailedReactHTMLElement<{
            type: string;
            className: string;
            onClick: () => void;
        }, HTMLElement> | null;
        renderFindReplace(): React.DetailedReactHTMLElement<{
            key: string;
            className: string;
            onClick: () => any;
        }, HTMLElement> | null;
        renderTitleBar(): React.DetailedReactHTMLElement<{
            style: {
                position: "absolute";
                top: number;
                left: number;
                right: number;
                height: number;
                padding: number;
            };
        }, HTMLElement>;
        renderQuickfilter(): React.DetailedReactHTMLElement<{
            style: {
                position: "absolute";
                top: number;
                left: number;
                right: number;
            };
            ref: (c: HTMLElement | null) => HTMLElement | null;
        }, HTMLElement>;
        renderEditor(): React.CElement<any, DatagridEditorComponent> | undefined;
        renderFindReplaceModal(filters: any): React.CElement<any, any>;
        render(): React.DetailedReactHTMLElement<{
            style: {
                width: string;
                height: string;
                position: "relative";
                paddingTop: any;
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
declare class DatagridEditorComponent extends React.Component {
    static initClass(): void;
    constructor(props: any);
    render(): React.CElement<{
        title?: React.ReactNode;
        actionLabel?: React.ReactNode;
        cancelLabel?: React.ReactNode;
        deleteLabel?: React.ReactNode;
        onAction?: (() => void) | undefined;
        onCancel?: (() => void) | undefined;
        onDelete?: (() => void) | undefined;
        size?: "full" | "large" | undefined;
        actionBusy?: boolean | undefined;
    }, ActionCancelModalComponent>;
}

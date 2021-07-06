import PropTypes from "prop-types";
import React from "react";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
export default class DatagridComponent extends React.Component {
    static propTypes: {
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        datagridDataSource: PropTypes.Validator<object>;
        design: PropTypes.Validator<object>;
        onDesignChange: PropTypes.Requireable<(...args: any[]) => any>;
        titleElem: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        extraTitleButtonsElem: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        canEditValue: PropTypes.Requireable<(...args: any[]) => any>;
        updateValue: PropTypes.Requireable<(...args: any[]) => any>;
        onRowClick: PropTypes.Requireable<(...args: any[]) => any>;
        onRowDoubleClick: PropTypes.Requireable<(...args: any[]) => any>;
        quickfilterLocks: PropTypes.Requireable<any[]>;
        filters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
    };
    constructor(props: any);
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
}
declare class DatagridEditorComponent extends React.Component {
    static propTypes: {
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        design: PropTypes.Validator<object>;
        onDesignChange: PropTypes.Validator<(...args: any[]) => any>;
        onCancel: PropTypes.Validator<(...args: any[]) => any>;
    };
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
export {};

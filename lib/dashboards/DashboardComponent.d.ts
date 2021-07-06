import PropTypes from "prop-types";
import React from "react";
export default class DashboardComponent extends React.Component {
    static propTypes: {
        design: PropTypes.Validator<object>;
        onDesignChange: PropTypes.Requireable<(...args: any[]) => any>;
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        dashboardDataSource: PropTypes.Validator<object>;
        titleElem: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        extraTitleButtonsElem: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        undoStackKey: PropTypes.Requireable<any>;
        printScaling: PropTypes.Requireable<boolean>;
        onRowClick: PropTypes.Requireable<(...args: any[]) => any>;
        namedStrings: PropTypes.Requireable<object>;
        quickfilterLocks: PropTypes.Requireable<any[]>;
        quickfiltersValues: PropTypes.Requireable<any[]>;
        filters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
        hideTitleBar: PropTypes.Requireable<boolean>;
    };
    static defaultProps: {
        printScaling: boolean;
    };
    static childContextTypes: {
        locale: PropTypes.Requireable<string>;
        activeTables: PropTypes.Requireable<string[]>;
    };
    getChildContext(): {
        locale: any;
        activeTables: string[];
    };
    constructor(props: any);
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
}

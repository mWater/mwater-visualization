/// <reference types="jquery" />
import PropTypes from "prop-types";
import React from "react";
import * as uiComponents from "./UIComponents";
import { Schema } from "mwater-expressions";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
interface MWaterCompleteTableSelectComponentProps {
    /** Url to hit api */
    apiUrl: string;
    /** Optional client */
    client?: string;
    schema: Schema;
    /** User id */
    user?: string;
    table?: string;
    /** Called with table selected */
    onChange: any;
    extraTables: any;
    onExtraTablesChange: any;
}
export default class MWaterCompleteTableSelectComponent extends React.Component<MWaterCompleteTableSelectComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    handleExtraTableAdd: (tableId: any) => any;
    handleExtraTableRemove: (tableId: any) => any;
    renderSites(): React.CElement<{
        items: {
            name: string;
            desc?: string | undefined;
            onClick: () => void;
            onRemove?: (() => void) | undefined;
        }[];
        hint?: string | undefined;
    }, uiComponents.OptionListComponent>;
    renderForms(): React.CElement<any, FormsListComponent>;
    renderIndicators(): React.CElement<any, IndicatorsListComponent>;
    renderIssues(): React.CElement<any, IssuesListComponent>;
    renderSweetSense(): React.CElement<{
        items: {
            name: string;
            desc?: string | undefined;
            onClick: () => void;
            onRemove?: (() => void) | undefined;
        }[];
        hint?: string | undefined;
    }, uiComponents.OptionListComponent>;
    renderTablesets(): React.FunctionComponentElement<{
        apiUrl: string;
        schema: Schema;
        client?: string | undefined;
        user?: string | undefined;
        onChange: (tableId: string | null) => void;
        extraTables: string[];
        onExtraTableAdd: (tableId: string) => void;
        onExtraTableRemove: (tableId: string) => void;
        locale?: string | undefined;
    }>;
    renderMetrics(): React.FunctionComponentElement<{
        apiUrl: string;
        schema: Schema;
        client?: string | undefined;
        user?: string | undefined;
        onChange: (tableId: string | null) => void;
        extraTables: string[];
        onExtraTableAdd: (tableId: string) => void;
        onExtraTableRemove: (tableId: string) => void;
        locale?: string | undefined;
    }>;
    renderAssets(): React.FunctionComponentElement<{
        apiUrl: string;
        schema: Schema;
        client?: string | undefined;
        user?: string | undefined;
        onChange: (tableId: string | null) => void;
        extraTables: string[];
        onExtraTableAdd: (tableId: string) => void;
        onExtraTableRemove: (tableId: string) => void;
        locale?: string | undefined;
    }>;
    renderOther(): React.CElement<{
        items: {
            name: string;
            desc?: string | undefined;
            onClick: () => void;
            onRemove?: (() => void) | undefined;
        }[];
        hint?: string | undefined;
    }, uiComponents.OptionListComponent>;
    getSweetSenseTables(): import("mwater-expressions").Table[];
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
interface FormsListComponentProps {
    /** Url to hit api */
    apiUrl: string;
    /** Optional client */
    client?: string;
    schema: Schema;
    /** User id */
    user?: string;
    /** Called with table selected */
    onChange: any;
    extraTables: any;
    onExtraTableAdd: any;
    onExtraTableRemove: any;
}
interface FormsListComponentState {
    error?: any;
    search: any;
    forms: {
        id: string;
        name: string;
        desc?: string;
    }[] | null;
}
declare class FormsListComponent extends React.Component<FormsListComponentProps, FormsListComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: any);
    componentDidMount(): void;
    handleTableRemove: (table: any) => any;
    searchRef: (comp: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
interface IndicatorsListComponentProps {
    /** Url to hit api */
    apiUrl: string;
    /** Optional client */
    client?: string;
    schema: Schema;
    /** User id */
    user?: string;
    /** Called with table selected */
    onChange: any;
    extraTables: any;
    onExtraTableAdd: any;
    onExtraTableRemove: any;
}
interface IndicatorsListComponentState {
    error?: any;
    search: any;
    indicators: any[] | null;
}
declare class IndicatorsListComponent extends React.Component<IndicatorsListComponentProps, IndicatorsListComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    addIndicatorConfirmPopup: AddIndicatorConfirmPopupComponent | null;
    constructor(props: any);
    componentDidMount(): JQuery.jqXHR<any>;
    handleTableRemove: (table: any) => any;
    searchRef: (comp: any) => any;
    handleSelect: (tableId: any) => void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
interface AddIndicatorConfirmPopupComponentProps {
    schema: Schema;
    /** Called with table selected */
    onChange: any;
    onExtraTableAdd: any;
}
interface AddIndicatorConfirmPopupComponentState {
    indicatorTable: any;
    visible: any;
}
declare class AddIndicatorConfirmPopupComponent extends React.Component<AddIndicatorConfirmPopupComponentProps, AddIndicatorConfirmPopupComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: any);
    show(indicatorTable: any): void;
    renderContents(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    render(): React.CElement<import("react-library/lib/ModalPopupComponent").ModalPopupComponentProps, ModalPopupComponent> | null;
}
interface IssuesListComponentProps {
    /** Url to hit api */
    apiUrl: string;
    /** Optional client */
    client?: string;
    schema: Schema;
    /** User id */
    user?: string;
    /** Called with table selected */
    onChange: any;
    extraTables: any;
    onExtraTableAdd: any;
    onExtraTableRemove: any;
}
interface IssuesListComponentState {
    error?: any;
    search: any;
    issueTypes: any[] | null;
}
declare class IssuesListComponent extends React.Component<IssuesListComponentProps, IssuesListComponentState> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: any);
    componentDidMount(): JQuery.jqXHR<any>;
    handleTableRemove: (table: any) => any;
    searchRef: (comp: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
export {};

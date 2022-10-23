import PropTypes from "prop-types";
import React from "react";
import { DataSource, LocalizedString, Schema } from "mwater-expressions";
import IdArrayQuickfilterComponent from "./IdArrayQuickfilterComponent";
import { Quickfilter, QuickfilterLock } from "./Quickfilter";
import { QuickfiltersDataSource } from "./QuickfiltersDataSource";
import { JsonQLFilter } from "..";
export interface QuickfiltersComponentProps {
    /** Design of quickfilters. See README.md */
    design: Quickfilter[];
    /** Current values of quickfilters (state of filters selected) */
    values?: any[];
    /** Called when value changes */
    onValuesChange: (values: any[]) => void;
    locks?: QuickfilterLock[];
    schema: Schema;
    dataSource: DataSource;
    quickfiltersDataSource: QuickfiltersDataSource;
    /** Filters to add to restrict quick filter data to */
    filters?: JsonQLFilter[];
    /** True to hide top border */
    hideTopBorder?: boolean;
    /** Called when user hides the quickfilter bar */
    onHide?: () => void;
}
/** Displays quick filters and allows their value to be modified */
export default class QuickfiltersComponent extends React.Component<QuickfiltersComponentProps> {
    renderQuickfilter(item: any, index: any): React.CElement<EnumQuickfilterComponentProps, EnumQuickfilterComponent> | React.CElement<TextQuickfilterComponentProps, TextQuickfilterComponent> | React.CElement<DateQuickfilterComponentProps, DateQuickfilterComponent> | React.CElement<import("./IdArrayQuickfilterComponent").IdArrayQuickfilterComponentProps, IdArrayQuickfilterComponent> | null;
    render(): React.DetailedReactHTMLElement<{
        style: {
            borderTop: string | undefined;
            borderBottom: string;
            padding: number;
        };
    }, HTMLElement> | null;
}
interface EnumQuickfilterComponentProps {
    label?: string;
    schema: Schema;
    /** true to display multiple values */
    multi?: boolean;
    /** Current value of quickfilter (state of filter selected) */
    value?: any;
    /** Called when value changes */
    onValueChange?: any;
    options: {
        /** id of option */
        id: string;
        /** localized name */
        name: LocalizedString;
    }[];
}
/** Quickfilter for an enum */
declare class EnumQuickfilterComponent extends React.Component<EnumQuickfilterComponentProps> {
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    handleSingleChange: (val: any) => any;
    handleMultiChange: (val: any) => any;
    renderSingleSelect(options: any[]): React.FunctionComponentElement<Omit<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "id" | "name" | "value" | "form" | "className" | "autoFocus" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "onFocus" | "onBlur" | "onChange" | "onKeyDown" | "isClearable" | "theme" | "ariaLiveMessages" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "tabIndex" | "options" | "placeholder" | "aria-live" | "styles" | "isLoading" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "tabSelectsValue">> & Partial<Pick<{
        'aria-live': string;
        backspaceRemovesValue: boolean;
        blurInputOnSelect: boolean;
        captureMenuScroll: boolean;
        closeMenuOnSelect: boolean;
        closeMenuOnScroll: boolean;
        components: {};
        controlShouldRenderValue: boolean;
        escapeClearsValue: boolean;
        filterOption: (option: import("react-select/dist/declarations/src/filters").FilterOptionOption<unknown>, rawInput: string) => boolean;
        formatGroupLabel: <Option_1, Group_1 extends import("react-select").GroupBase<Option_1>>(group: Group_1) => string;
        getOptionLabel: <Option_2>(option: Option_2) => string;
        getOptionValue: <Option_3>(option: Option_3) => string;
        isDisabled: boolean;
        isLoading: boolean;
        isMulti: boolean;
        isRtl: boolean;
        isSearchable: boolean;
        isOptionDisabled: <Option_4>(option: Option_4) => boolean;
        loadingMessage: () => string;
        maxMenuHeight: number;
        minMenuHeight: number;
        menuIsOpen: boolean;
        menuPlacement: string;
        menuPosition: string;
        menuShouldBlockScroll: boolean;
        menuShouldScrollIntoView: boolean;
        noOptionsMessage: () => string;
        openMenuOnFocus: boolean;
        openMenuOnClick: boolean;
        options: never[];
        pageSize: number;
        placeholder: string;
        screenReaderStatus: ({ count }: {
            count: number;
        }) => string;
        styles: {};
        tabIndex: number;
        tabSelectsValue: boolean;
    }, never>>, "value" | "onChange" | "inputValue" | "menuIsOpen" | "onInputChange" | "onMenuOpen" | "onMenuClose"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "id" | "name" | "value" | "form" | "className" | "autoFocus" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "onFocus" | "onBlur" | "onChange" | "onKeyDown" | "isClearable" | "theme" | "ariaLiveMessages" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "tabIndex" | "options" | "placeholder" | "aria-live" | "styles" | "isLoading" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "tabSelectsValue">> & Partial<Pick<{
        'aria-live': string;
        backspaceRemovesValue: boolean;
        blurInputOnSelect: boolean;
        captureMenuScroll: boolean;
        closeMenuOnSelect: boolean;
        closeMenuOnScroll: boolean;
        components: {};
        controlShouldRenderValue: boolean;
        escapeClearsValue: boolean;
        filterOption: (option: import("react-select/dist/declarations/src/filters").FilterOptionOption<unknown>, rawInput: string) => boolean;
        formatGroupLabel: <Option_1, Group_1 extends import("react-select").GroupBase<Option_1>>(group: Group_1) => string;
        getOptionLabel: <Option_2>(option: Option_2) => string;
        getOptionValue: <Option_3>(option: Option_3) => string;
        isDisabled: boolean;
        isLoading: boolean;
        isMulti: boolean;
        isRtl: boolean;
        isSearchable: boolean;
        isOptionDisabled: <Option_4>(option: Option_4) => boolean;
        loadingMessage: () => string;
        maxMenuHeight: number;
        minMenuHeight: number;
        menuIsOpen: boolean;
        menuPlacement: string;
        menuPosition: string;
        menuShouldBlockScroll: boolean;
        menuShouldScrollIntoView: boolean;
        noOptionsMessage: () => string;
        openMenuOnFocus: boolean;
        openMenuOnClick: boolean;
        options: never[];
        pageSize: number;
        placeholder: string;
        screenReaderStatus: ({ count }: {
            count: number;
        }) => string;
        styles: {};
        tabIndex: number;
        tabSelectsValue: boolean;
    }, never>>> & import("react-select/dist/declarations/src/useStateManager").StateManagerAdditionalProps<unknown> & React.RefAttributes<import("react-select/dist/declarations/src/Select").default<unknown, boolean, import("react-select").GroupBase<unknown>>>>;
    renderMultiSelect(options: any[]): React.FunctionComponentElement<Omit<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "id" | "name" | "value" | "form" | "className" | "autoFocus" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "onFocus" | "onBlur" | "onChange" | "onKeyDown" | "isClearable" | "theme" | "ariaLiveMessages" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "tabIndex" | "options" | "placeholder" | "aria-live" | "styles" | "isLoading" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "tabSelectsValue">> & Partial<Pick<{
        'aria-live': string;
        backspaceRemovesValue: boolean;
        blurInputOnSelect: boolean;
        captureMenuScroll: boolean;
        closeMenuOnSelect: boolean;
        closeMenuOnScroll: boolean;
        components: {};
        controlShouldRenderValue: boolean;
        escapeClearsValue: boolean;
        filterOption: (option: import("react-select/dist/declarations/src/filters").FilterOptionOption<unknown>, rawInput: string) => boolean;
        formatGroupLabel: <Option_1, Group_1 extends import("react-select").GroupBase<Option_1>>(group: Group_1) => string;
        getOptionLabel: <Option_2>(option: Option_2) => string;
        getOptionValue: <Option_3>(option: Option_3) => string;
        isDisabled: boolean;
        isLoading: boolean;
        isMulti: boolean;
        isRtl: boolean;
        isSearchable: boolean;
        isOptionDisabled: <Option_4>(option: Option_4) => boolean;
        loadingMessage: () => string;
        maxMenuHeight: number;
        minMenuHeight: number;
        menuIsOpen: boolean;
        menuPlacement: string;
        menuPosition: string;
        menuShouldBlockScroll: boolean;
        menuShouldScrollIntoView: boolean;
        noOptionsMessage: () => string;
        openMenuOnFocus: boolean;
        openMenuOnClick: boolean;
        options: never[];
        pageSize: number;
        placeholder: string;
        screenReaderStatus: ({ count }: {
            count: number;
        }) => string;
        styles: {};
        tabIndex: number;
        tabSelectsValue: boolean;
    }, never>>, "value" | "onChange" | "inputValue" | "menuIsOpen" | "onInputChange" | "onMenuOpen" | "onMenuClose"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "id" | "name" | "value" | "form" | "className" | "autoFocus" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "onFocus" | "onBlur" | "onChange" | "onKeyDown" | "isClearable" | "theme" | "ariaLiveMessages" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "tabIndex" | "options" | "placeholder" | "aria-live" | "styles" | "isLoading" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "tabSelectsValue">> & Partial<Pick<{
        'aria-live': string;
        backspaceRemovesValue: boolean;
        blurInputOnSelect: boolean;
        captureMenuScroll: boolean;
        closeMenuOnSelect: boolean;
        closeMenuOnScroll: boolean;
        components: {};
        controlShouldRenderValue: boolean;
        escapeClearsValue: boolean;
        filterOption: (option: import("react-select/dist/declarations/src/filters").FilterOptionOption<unknown>, rawInput: string) => boolean;
        formatGroupLabel: <Option_1, Group_1 extends import("react-select").GroupBase<Option_1>>(group: Group_1) => string;
        getOptionLabel: <Option_2>(option: Option_2) => string;
        getOptionValue: <Option_3>(option: Option_3) => string;
        isDisabled: boolean;
        isLoading: boolean;
        isMulti: boolean;
        isRtl: boolean;
        isSearchable: boolean;
        isOptionDisabled: <Option_4>(option: Option_4) => boolean;
        loadingMessage: () => string;
        maxMenuHeight: number;
        minMenuHeight: number;
        menuIsOpen: boolean;
        menuPlacement: string;
        menuPosition: string;
        menuShouldBlockScroll: boolean;
        menuShouldScrollIntoView: boolean;
        noOptionsMessage: () => string;
        openMenuOnFocus: boolean;
        openMenuOnClick: boolean;
        options: never[];
        pageSize: number;
        placeholder: string;
        screenReaderStatus: ({ count }: {
            count: number;
        }) => string;
        styles: {};
        tabIndex: number;
        tabSelectsValue: boolean;
    }, never>>> & import("react-select/dist/declarations/src/useStateManager").StateManagerAdditionalProps<unknown> & React.RefAttributes<import("react-select/dist/declarations/src/Select").default<unknown, boolean, import("react-select").GroupBase<unknown>>>>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "inline-block";
            paddingRight: number;
        };
    }, HTMLElement>;
}
interface TextQuickfilterComponentProps {
    label: string;
    schema: Schema;
    /** See QuickfiltersDataSource */
    quickfiltersDataSource: QuickfiltersDataSource;
    expr: any;
    index: number;
    /** Current value of quickfilter (state of filter selected) */
    value?: any;
    /** Called when value changes */
    onValueChange?: any;
    /** true to display multiple values */
    multi?: boolean;
    /** Filters to add to restrict quick filter data to */
    filters?: JsonQLFilter[];
}
declare class TextQuickfilterComponent extends React.Component<TextQuickfilterComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "inline-block";
            paddingRight: number;
        };
    }, HTMLElement>;
}
interface DateQuickfilterComponentProps {
    label?: string;
    schema: Schema;
    expr: any;
    /** Current value of quickfilter (state of filter selected) */
    value?: any;
    onValueChange: any;
}
declare class DateQuickfilterComponent extends React.Component<DateQuickfilterComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            display: "inline-block";
            paddingRight: number;
        };
    }, HTMLElement>;
}
export {};

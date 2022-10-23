import React from "react";
import { Schema } from "mwater-expressions";
import { JsonQLFilter } from "../JsonQLFilter";
import { QuickfiltersDataSource } from "./QuickfiltersDataSource";
export interface TextLiteralComponentProps {
    value?: any;
    onChange?: any;
    schema: Schema;
    /** See QuickfiltersDataSource */
    quickfiltersDataSource: QuickfiltersDataSource;
    expr: any;
    index: number;
    /** true to display multiple values */
    multi?: boolean;
    /** Filters to add to restrict quick filter data to */
    filters?: JsonQLFilter[];
}
/** Displays a combo box that allows selecting single or multiple text values from an expression
 * The expression can be type `text` or `text[]`
 */
export default class TextLiteralComponent extends React.Component<TextLiteralComponentProps> {
    handleSingleChange: (val: any) => any;
    handleMultipleChange: (val: any) => any;
    getOptions: (input: any, cb: any) => void;
    renderSingle(): React.FunctionComponentElement<Omit<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "id" | "name" | "value" | "form" | "className" | "autoFocus" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "onFocus" | "onBlur" | "onChange" | "onKeyDown" | "isClearable" | "theme" | "ariaLiveMessages" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "tabIndex" | "options" | "placeholder" | "aria-live" | "styles" | "isLoading" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "tabSelectsValue">> & Partial<Pick<{
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
    }, never>>> & import("react-select/dist/declarations/src/useStateManager").StateManagerAdditionalProps<unknown> & import("react-select/dist/declarations/src/useAsync").AsyncAdditionalProps<unknown, import("react-select").GroupBase<unknown>> & React.RefAttributes<import("react-select/dist/declarations/src/Select").default<unknown, boolean, import("react-select").GroupBase<unknown>>>>;
    renderMultiple(): React.FunctionComponentElement<Omit<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "id" | "name" | "value" | "form" | "className" | "autoFocus" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "onFocus" | "onBlur" | "onChange" | "onKeyDown" | "isClearable" | "theme" | "ariaLiveMessages" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<unknown>>, "tabIndex" | "options" | "placeholder" | "aria-live" | "styles" | "isLoading" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "tabSelectsValue">> & Partial<Pick<{
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
    }, never>>> & import("react-select/dist/declarations/src/useStateManager").StateManagerAdditionalProps<unknown> & import("react-select/dist/declarations/src/useAsync").AsyncAdditionalProps<unknown, import("react-select").GroupBase<unknown>> & React.RefAttributes<import("react-select/dist/declarations/src/Select").default<unknown, boolean, import("react-select").GroupBase<unknown>>>>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
        };
    }, HTMLElement>;
}

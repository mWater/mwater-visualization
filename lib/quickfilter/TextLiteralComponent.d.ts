import React from "react";
import { JsonQLFilter } from "../JsonQLFilter";
interface TextLiteralComponentProps {
    value?: any;
    onChange?: any;
    schema: any;
    /** See QuickfiltersDataSource */
    quickfiltersDataSource: any;
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
    renderSingle(): React.FunctionComponentElement<Pick<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "form" | "id" | "onChange" | "value" | "onFocus" | "onBlur" | "name" | "className" | "theme" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "ariaLiveMessages" | "autoFocus" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isClearable" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onKeyDown" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "options" | "placeholder" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "aria-live" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isLoading" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "styles" | "tabIndex" | "tabSelectsValue">> & Partial<Pick<{
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
    }, never>>, "form" | "id" | "onFocus" | "onBlur" | "options" | "name" | "placeholder" | "className" | "theme" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "aria-live" | "ariaLiveMessages" | "autoFocus" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "classNamePrefix" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "delimiter" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "formatOptionLabel" | "getOptionLabel" | "getOptionValue" | "hideSelectedOptions" | "inputId" | "instanceId" | "isClearable" | "isLoading" | "isOptionDisabled" | "isOptionSelected" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuPlacement" | "menuPosition" | "menuPortalTarget" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "onKeyDown" | "onMenuScrollToTop" | "onMenuScrollToBottom" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "styles" | "tabIndex" | "tabSelectsValue"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "form" | "id" | "onChange" | "value" | "onFocus" | "onBlur" | "name" | "className" | "theme" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "ariaLiveMessages" | "autoFocus" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isClearable" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onKeyDown" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "options" | "placeholder" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "aria-live" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isLoading" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "styles" | "tabIndex" | "tabSelectsValue">> & Partial<Pick<{
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
    }, never>>> & import("react-select/dist/declarations/src/useStateManager").StateManagerAdditionalProps<unknown> & import("react-select/dist/declarations/src/useAsync").AsyncAdditionalProps<unknown, import("react-select").GroupBase<any>> & React.RefAttributes<import("react-select/dist/declarations/src/Select").default<unknown, boolean, import("react-select").GroupBase<any>>>>;
    renderMultiple(): React.FunctionComponentElement<Pick<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "form" | "id" | "onChange" | "value" | "onFocus" | "onBlur" | "name" | "className" | "theme" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "ariaLiveMessages" | "autoFocus" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isClearable" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onKeyDown" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "options" | "placeholder" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "aria-live" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isLoading" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "styles" | "tabIndex" | "tabSelectsValue">> & Partial<Pick<{
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
    }, never>>, "form" | "id" | "onFocus" | "onBlur" | "options" | "name" | "placeholder" | "className" | "theme" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "aria-live" | "ariaLiveMessages" | "autoFocus" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "classNamePrefix" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "delimiter" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "formatOptionLabel" | "getOptionLabel" | "getOptionValue" | "hideSelectedOptions" | "inputId" | "instanceId" | "isClearable" | "isLoading" | "isOptionDisabled" | "isOptionSelected" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuPlacement" | "menuPosition" | "menuPortalTarget" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "onKeyDown" | "onMenuScrollToTop" | "onMenuScrollToBottom" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "styles" | "tabIndex" | "tabSelectsValue"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "form" | "id" | "onChange" | "value" | "onFocus" | "onBlur" | "name" | "className" | "theme" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "ariaLiveMessages" | "autoFocus" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isClearable" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onKeyDown" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "options" | "placeholder" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "aria-live" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isLoading" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "styles" | "tabIndex" | "tabSelectsValue">> & Partial<Pick<{
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
    }, never>>> & import("react-select/dist/declarations/src/useStateManager").StateManagerAdditionalProps<unknown> & import("react-select/dist/declarations/src/useAsync").AsyncAdditionalProps<unknown, import("react-select").GroupBase<any>> & React.RefAttributes<import("react-select/dist/declarations/src/Select").default<unknown, boolean, import("react-select").GroupBase<any>>>>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
        };
    }, HTMLElement>;
}
export {};

import React from "react";
import { DataSource, Schema } from "mwater-expressions";
interface DetailLevelSelectComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** admin region */
    scope: string;
    /** admin region */
    scopeLevel: number;
    /** Detail level within */
    detailLevel?: number;
    onChange: any;
}
interface DetailLevelSelectComponentState {
    options: any;
}
export default class DetailLevelSelectComponent extends React.Component<DetailLevelSelectComponentProps, DetailLevelSelectComponentState> {
    constructor(props: any);
    componentWillMount(): any;
    componentWillReceiveProps(nextProps: any): any;
    loadLevels(props: any): any;
    render(): React.FunctionComponentElement<Pick<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "form" | "id" | "onChange" | "value" | "autoFocus" | "className" | "isClearable" | "name" | "onBlur" | "onFocus" | "onKeyDown" | "theme" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "ariaLiveMessages" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "tabIndex" | "options" | "placeholder" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "aria-live" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isLoading" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "styles" | "tabSelectsValue">> & Partial<Pick<{
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
    }, never>>, "form" | "id" | "autoFocus" | "className" | "isClearable" | "name" | "onBlur" | "onFocus" | "onKeyDown" | "tabIndex" | "options" | "placeholder" | "theme" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "aria-live" | "ariaLiveMessages" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "classNamePrefix" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "delimiter" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "formatOptionLabel" | "getOptionLabel" | "getOptionValue" | "hideSelectedOptions" | "inputId" | "instanceId" | "isLoading" | "isOptionDisabled" | "isOptionSelected" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuPlacement" | "menuPosition" | "menuPortalTarget" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "onMenuScrollToTop" | "onMenuScrollToBottom" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "styles" | "tabSelectsValue"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "form" | "id" | "onChange" | "value" | "autoFocus" | "className" | "isClearable" | "name" | "onBlur" | "onFocus" | "onKeyDown" | "theme" | "aria-errormessage" | "aria-invalid" | "aria-label" | "aria-labelledby" | "ariaLiveMessages" | "classNamePrefix" | "delimiter" | "formatOptionLabel" | "hideSelectedOptions" | "inputValue" | "inputId" | "instanceId" | "isOptionSelected" | "menuPortalTarget" | "onInputChange" | "onMenuOpen" | "onMenuClose" | "onMenuScrollToTop" | "onMenuScrollToBottom"> & Partial<Pick<import("react-select/dist/declarations/src/Select").Props<unknown, boolean, import("react-select").GroupBase<any>>, "tabIndex" | "options" | "placeholder" | "isDisabled" | "isRtl" | "isMulti" | "loadingMessage" | "noOptionsMessage" | "aria-live" | "backspaceRemovesValue" | "blurInputOnSelect" | "captureMenuScroll" | "closeMenuOnSelect" | "closeMenuOnScroll" | "components" | "controlShouldRenderValue" | "escapeClearsValue" | "filterOption" | "formatGroupLabel" | "getOptionLabel" | "getOptionValue" | "isLoading" | "isOptionDisabled" | "isSearchable" | "minMenuHeight" | "maxMenuHeight" | "menuIsOpen" | "menuPlacement" | "menuPosition" | "menuShouldBlockScroll" | "menuShouldScrollIntoView" | "openMenuOnFocus" | "openMenuOnClick" | "pageSize" | "screenReaderStatus" | "styles" | "tabSelectsValue">> & Partial<Pick<{
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
    }, never>>> & import("react-select/dist/declarations/src/useStateManager").StateManagerAdditionalProps<unknown> & React.RefAttributes<import("react-select/dist/declarations/src/Select").default<unknown, boolean, import("react-select").GroupBase<any>>>> | React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
export {};

import React from "react";
export interface SectionComponentProps {
    icon?: string;
    label?: any;
}
export declare class SectionComponent extends React.Component<SectionComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            marginBottom: number;
        };
    }, HTMLElement>;
}
/** List of options with a name and description each */
export declare class OptionListComponent extends React.Component<{
    items: {
        name: string;
        desc?: string;
        onClick: () => void;
        onRemove?: () => void;
    }[];
    hint?: string;
}> {
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
interface OptionComponentProps {
    name?: string;
    desc?: string;
    onClick: any;
    onRemove?: any;
}
export declare class OptionComponent extends React.Component<OptionComponentProps> {
    handleClick: (ev: any) => any;
    render(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: any;
    }, HTMLElement>;
}
interface SwitchViewComponentProps {
    /** Map of view id to view element */
    views: any;
    viewId: string;
}
interface SwitchViewComponentState {
    measuring: any;
}
export declare class SwitchViewComponent extends React.Component<SwitchViewComponentProps, SwitchViewComponentState> {
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): void;
    refCallback: (id: any, comp: any) => any;
    componentDidUpdate(prevProps: any, prevState: any): void;
    render(): React.CElement<{
        style: {};
    }, React.Component<{
        style: {};
    }, any, any>>;
}
interface ToggleEditComponentProps {
    forceOpen?: boolean;
    initiallyOpen?: boolean;
    label: any;
    editor: any;
    onRemove?: any;
}
interface ToggleEditComponentState {
    open: any;
}
export declare class ToggleEditComponent extends React.Component<ToggleEditComponentProps, ToggleEditComponentState> {
    constructor(props: any);
    close: () => void;
    open: () => void;
    handleToggle: () => void;
    editorRef: (editorComp: any) => any;
    render(): React.CElement<any, SwitchViewComponent>;
}
interface ButtonToggleComponentProps {
    value?: any;
    /** List of layers */
    options: any;
    onChange: any;
}
export declare class ButtonToggleComponent extends React.Component<ButtonToggleComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
export {};

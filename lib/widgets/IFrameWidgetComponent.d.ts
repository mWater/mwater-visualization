import React from "react";
import DropdownWidgetComponent from "./DropdownWidgetComponent";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
export interface IFrameWidgetComponentProps {
    design: any;
    /** Called with new design. null/undefined for readonly */
    onDesignChange?: any;
    width?: number;
    height?: number;
}
interface IFrameWidgetComponentState {
    editUrl: any;
    editing: any;
}
export default class IFrameWidgetComponent extends React.Component<IFrameWidgetComponentProps, IFrameWidgetComponentState> {
    constructor(props: any);
    handleStartEditing: () => void;
    handleEndEditing: () => any;
    renderEditor(): React.CElement<import("react-library/lib/ModalPopupComponent").ModalPopupComponentProps, ModalPopupComponent> | null;
    renderEditLink(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: () => void;
    }, HTMLElement>;
    render(): React.CElement<import("./DropdownWidgetComponent").DropdownWidgetComponentProps, DropdownWidgetComponent>;
}
export {};

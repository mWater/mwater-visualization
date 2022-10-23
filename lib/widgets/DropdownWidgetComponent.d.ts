import React from "react";
export interface DropdownWidgetComponentProps {
    /** Width specification */
    width?: any;
    /** Height specification */
    height?: any;
    dropdownItems: any;
}
export default class DropdownWidgetComponent extends React.Component<DropdownWidgetComponentProps> {
    renderDropdownItem: (item: any, i: any) => React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderDropdown(): React.ReactElement<{
        style: {
            position: string;
            right: number;
            top: number;
            cursor: string;
            zIndex: number;
        };
    }, string | React.JSXElementConstructor<any>> | null;
    closeMenu: () => JQuery<HTMLElement>;
    render(): React.DetailedReactHTMLElement<{
        className: string;
        onMouseLeave: () => JQuery<HTMLElement>;
        style: {
            width: any;
            height: any;
        };
    }, HTMLElement>;
}

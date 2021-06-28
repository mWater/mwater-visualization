import React from "react";
interface DropdownWidgetComponentProps {
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
    }, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
    closeMenu: () => any;
    render(): React.DetailedReactHTMLElement<{
        className: string;
        onMouseLeave: () => any;
        style: {
            width: any;
            height: any;
        };
    }, HTMLElement>;
}
export {};

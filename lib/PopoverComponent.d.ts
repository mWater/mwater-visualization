import React from "react";
interface PopoverComponentProps {
    /** contents of popover */
    content: any;
    /** See http://getbootstrap.com/javascript/#popovers */
    placement?: string;
    visible: boolean;
}
export default class PopoverComponent extends React.Component<PopoverComponentProps> {
    componentDidMount(): Element | undefined;
    componentWillUnmount(): Element | undefined;
    componentDidUpdate(prevProps: any): Element | undefined;
    updatePopover(props: any, oldProps: any): Element | undefined;
    render(): string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactPortal | null | undefined;
}
export {};

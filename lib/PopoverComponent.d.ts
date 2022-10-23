import React from "react";
export interface PopoverComponentProps {
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
    render(): boolean | {} | React.ReactChild | React.ReactPortal | null | undefined;
}

import React from "react";
interface ZoomLevelsComponentProps {
    design: any;
    onDesignChange: any;
}
interface ZoomLevelsComponentState {
    expanded: any;
}
export default class ZoomLevelsComponent extends React.Component<ZoomLevelsComponentProps, ZoomLevelsComponentState> {
    constructor(props: any);
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
export {};

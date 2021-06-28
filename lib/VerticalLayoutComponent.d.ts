import React from "react";
interface VerticalLayoutComponentProps {
    height: number;
    relativeHeights: any;
}
interface VerticalLayoutComponentState {
    availableHeight: any;
}
export default class VerticalLayoutComponent extends React.Component<VerticalLayoutComponentProps, VerticalLayoutComponentState> {
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): void;
    componentDidMount(): void;
    recalculateSize(props: any): void;
    getComponent(key: any): any;
    render(): React.DetailedReactHTMLElement<{
        style: {
            height: number;
        };
    }, HTMLElement>;
}
export {};

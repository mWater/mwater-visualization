import React from "react";
interface DetailLevelSelectComponentProps {
    /** Schema to use */
    schema: any;
    dataSource: any;
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
    render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
export {};

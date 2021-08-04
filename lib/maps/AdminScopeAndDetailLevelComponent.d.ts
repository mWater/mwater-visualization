import React from "react";
interface AdminScopeAndDetailLevelComponentProps {
    /** Schema to use */
    schema: any;
    dataSource: any;
    /** admin region that is outside bounds. null for whole world */
    scope?: string;
    /** level of scope region. null for whole world */
    scopeLevel?: number;
    /** Detail level within scope region */
    detailLevel?: number;
    onScopeAndDetailLevelChange: any;
}
export default class AdminScopeAndDetailLevelComponent extends React.Component<AdminScopeAndDetailLevelComponentProps> {
    handleScopeChange: (scope: any, scopeLevel: any) => any;
    handleDetailLevelChange: (detailLevel: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};
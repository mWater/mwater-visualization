import React from "react";
interface ScopeAndDetailLevelComponentProps {
    /** Schema to use */
    schema: any;
    dataSource: any;
    /** admin region that is outside bounds. null for whole world */
    scope?: string;
    /** level of scope region. null for whole world */
    scopeLevel?: number;
    /** Detail level within scope region */
    detailLevel?: number;
    /** Called with (scope, scopeLevel, detailLevel) */
    onScopeAndDetailLevelChange: any;
    regionsTable: string;
}
export default class ScopeAndDetailLevelComponent extends React.Component<ScopeAndDetailLevelComponentProps> {
    handleScopeChange: (scope: any, scopeLevel: any) => any;
    handleDetailLevelChange: (detailLevel: any) => any;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

import React from "react";
import { DataSource, Schema } from "mwater-expressions";
export interface ScopeAndDetailLevelComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** admin region that is outside bounds. null for whole world */
    scope?: string;
    /** level of scope region. null for whole world */
    scopeLevel?: number | null;
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

import React from "react";
import { DataSource, Schema } from "mwater-expressions";
export interface AdminScopeAndDetailLevelComponentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** admin region that is outside bounds. null for whole world */
    scope?: number;
    /** level of scope region. null for whole world */
    scopeLevel?: number;
    /** Detail level within scope region */
    detailLevel?: number;
    onScopeAndDetailLevelChange: (scope: number | null, scopeLevel: number | null, detailLevel: number | null) => void;
}
export default class AdminScopeAndDetailLevelComponent extends React.Component<AdminScopeAndDetailLevelComponentProps> {
    handleScopeChange: (scope: number | null, scopeLevel: number | null) => void;
    handleDetailLevelChange: (detailLevel: any) => void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}

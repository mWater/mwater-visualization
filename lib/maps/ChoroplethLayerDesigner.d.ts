import React from 'react';
import { Schema, DataSource, Expr } from 'mwater-expressions';
import ChoroplethLayerDesign from './ChoroplethLayerDesign';
import { JsonQLFilter } from '../index';
import { Axis } from '../axes/Axis';
export default class ChoroplethLayerDesigner extends React.Component<{
    schema: Schema;
    dataSource: DataSource;
    design: ChoroplethLayerDesign;
    onDesignChange: (design: ChoroplethLayerDesign) => void;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters: JsonQLFilter[];
}> {
    update(mutation: (d: ChoroplethLayerDesign) => void): void;
    handleScopeAndDetailLevelChange: (scope: string | number | null, scopeLevel: number | null, detailLevel: number) => void;
    autoselectAdminRegionExpr: (table: string, regionsTable: string | null) => Expr;
    handleTableChange: (table: string | null) => void;
    handleColorChange: (color: string | null) => void;
    handleBorderColorChange: (color: string | null) => void;
    handleFilterChange: (filter: Expr) => void;
    handleColorAxisChange: (axis: Axis) => void;
    handleRegionsTableChange: (regionsTable: string) => void;
    handleAdminRegionExprChange: (expr: Expr) => void;
    handleRegionModeChange: (regionMode: "plain" | "indirect" | "direct") => void;
    handleFillOpacityChange: (fillOpacity: number) => void;
    handleDisplayNamesChange: (displayNames: boolean) => void;
    renderRegionMode(): JSX.Element;
    renderTable(): JSX.Element | null;
    renderRegionsTable(): JSX.Element;
    renderAdminRegionExpr(): JSX.Element | null;
    renderScopeAndDetailLevel(): React.CElement<{
        schema: Schema;
        dataSource: DataSource;
        scope: string | number | null;
        scopeLevel: number;
        detailLevel: number;
        onScopeAndDetailLevelChange: (scope: string | number | null, scopeLevel: number | null, detailLevel: number) => void;
    }, React.Component<{
        schema: Schema;
        dataSource: DataSource;
        scope: string | number | null;
        scopeLevel: number;
        detailLevel: number;
        onScopeAndDetailLevelChange: (scope: string | number | null, scopeLevel: number | null, detailLevel: number) => void;
    }, any, any>> | React.CElement<{
        schema: Schema;
        dataSource: DataSource;
        scope: string | number | null;
        scopeLevel: number | null;
        detailLevel: number;
        onScopeAndDetailLevelChange: (scope: string | number | null, scopeLevel: number | null, detailLevel: number) => void;
        regionsTable: string;
    }, React.Component<{
        schema: Schema;
        dataSource: DataSource;
        scope: string | number | null;
        scopeLevel: number | null;
        detailLevel: number;
        onScopeAndDetailLevelChange: (scope: string | number | null, scopeLevel: number | null, detailLevel: number) => void;
        regionsTable: string;
    }, any, any>>;
    renderDisplayNames(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderColor(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderColorAxis(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | null | undefined;
    renderFillOpacity(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderBorderColor(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    renderPopup(): React.CElement<{
        design: ChoroplethLayerDesign;
        onDesignChange: (design: ChoroplethLayerDesign) => void;
        schema: Schema;
        dataSource: DataSource;
        table: string;
        idTable: string;
        defaultPopupFilterJoins: {};
    }, React.Component<{
        design: ChoroplethLayerDesign;
        onDesignChange: (design: ChoroplethLayerDesign) => void;
        schema: Schema;
        dataSource: DataSource;
        table: string;
        idTable: string;
        defaultPopupFilterJoins: {};
    }, any, any>> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}

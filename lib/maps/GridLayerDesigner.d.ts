import React from 'react';
import { Schema, DataSource, Expr } from 'mwater-expressions';
import GridLayerDesign from './GridLayerDesign';
import { JsonQLFilter } from '../index';
import { Axis } from '../axes/Axis';
/** Designer for a grid layer */
export default class GridLayerDesigner extends React.Component<{
    schema: Schema;
    dataSource: DataSource;
    design: GridLayerDesign;
    onDesignChange: (design: GridLayerDesign) => void;
    /** array of filters to apply. Each is { table: table id, jsonql: jsonql condition with {alias} for tableAlias. Use injectAlias to correct */
    filters: JsonQLFilter[];
}> {
    update(mutation: (d: GridLayerDesign) => void): void;
    handleShapeChange: (shape: "square" | "hex") => void;
    handleTableChange: (table: string) => void;
    handleFilterChange: (filter: Expr) => void;
    handleColorAxisChange: (axis: Axis) => void;
    handleGeometryExprChange: (expr: Expr) => void;
    handleSizeUnitsChange: (sizeUnits: "pixels" | "meters") => void;
    handleSizeChange: (size: number) => void;
    handleFillOpacityChange: (fillOpacity: number) => void;
    handleBorderStyleChange: (borderStyle: "none" | "color") => void;
    renderShape(): JSX.Element;
    renderSize(): JSX.Element;
    renderTable(): JSX.Element;
    renderGeometryExpr(): JSX.Element | null;
    renderColorAxis(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | null;
    renderFillOpacity(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
    renderBorderStyle(): JSX.Element;
    renderFilter(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement> | null;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}

import React from "react";
import { PivotChartLayout, PivotChartLayoutRow } from "./PivotChartLayout";
export interface PivotChartLayoutComponentProps {
    layout: PivotChartLayout;
    editable?: boolean;
    /** Called with id of section (segment id or intersection id) */
    onEditSection?: (sectionId: string) => void;
    /** Called with id of segment */
    onRemoveSegment?: (sectionId: string) => void;
    /** Called with id of segment */
    onInsertBeforeSegment?: (sectionId: string) => void;
    /** Called with id of segment */
    onInsertAfterSegment?: (sectionId: string) => void;
    /** Called with id of segment */
    onAddChildSegment?: (sectionId: string) => void;
    /** Called with id of segment. Summarizes the segment */
    onSummarizeSegment?: (sectionId: string) => void;
}
interface PivotChartLayoutComponentState {
    hoverSection: string | null;
}
/** Displays a pivot chart from a layout */
export default class PivotChartLayoutComponent extends React.Component<PivotChartLayoutComponentProps, PivotChartLayoutComponentState> {
    cellComps: {
        [key: string]: any;
    };
    constructor(props: PivotChartLayoutComponentProps);
    recordCellComp: (rowIndex: any, columnIndex: any, comp: any) => any;
    renderRow(row: PivotChartLayoutRow, rowIndex: number): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderHoverPlusIcon: (key: any, x: any, y: any, onClick: any) => React.DetailedReactHTMLElement<{
        key: any;
        onClick: any;
        style: {
            position: "absolute";
            left: number;
            top: number;
            border: string;
            backgroundColor: "white";
            paddingLeft: number;
            paddingRight: number;
            paddingTop: number;
            color: "#337ab7";
            fontSize: number;
            cursor: "pointer";
            opacity: number;
        };
    }, HTMLElement>;
    renderHoverRemoveIcon: (key: any, x: any, y: any, onClick: any) => React.DetailedReactHTMLElement<{
        key: any;
        onClick: any;
        style: {
            position: "absolute";
            left: number;
            top: number;
            border: string;
            backgroundColor: "white";
            paddingLeft: number;
            paddingRight: number;
            paddingTop: number;
            color: "#337ab7";
            fontSize: number;
            cursor: "pointer";
            opacity: number;
        };
    }, HTMLElement>;
    renderHoverControls: () => React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | null | undefined;
    render(): React.DetailedReactHTMLElement<{
        style: {
            position: "relative";
        };
        onMouseLeave: () => void;
    }, HTMLElement>;
}
export {};

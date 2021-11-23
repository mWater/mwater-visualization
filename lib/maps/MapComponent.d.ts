import PropTypes from "prop-types";
import React from "react";
import MapControlComponent from "./MapControlComponent";
export default class MapComponent extends React.Component {
    static propTypes: {
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        mapDataSource: PropTypes.Validator<PropTypes.InferProps<{
            getLayerDataSource: PropTypes.Validator<(...args: any[]) => any>;
        }>>;
        design: PropTypes.Validator<object>;
        onDesignChange: PropTypes.Requireable<(...args: any[]) => any>;
        onRowClick: PropTypes.Requireable<(...args: any[]) => any>;
        extraFilters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
        titleElem: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        extraTitleButtonsElem: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    };
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: any);
    componentWillReceiveProps(nextProps: any): void;
    handleUndo: () => void;
    handleRedo: () => void;
    handleZoomLockClick: () => void;
    renderActionLinks(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    renderHeader(): React.DetailedReactHTMLElement<{
        style: {
            position: "absolute";
            top: number;
            left: number;
            right: number;
            height: number;
            padding: number;
            borderBottom: string;
        };
    }, HTMLElement>;
    handleDesignChange: (design: any) => any;
    renderView(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    renderDesigner(): React.CElement<import("./MapControlComponent").MapControlComponentProps, MapControlComponent>;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: string;
            height: string;
            position: "relative";
        };
    }, HTMLElement>;
}

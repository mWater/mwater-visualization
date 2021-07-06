import PropTypes from "prop-types";
import React from "react";
import ModalPopupComponent from "react-library/lib/ModalPopupComponent";
export default class OldMapViewComponent extends React.Component {
    static propTypes: {
        schema: PropTypes.Validator<object>;
        dataSource: PropTypes.Validator<object>;
        mapDataSource: PropTypes.Validator<PropTypes.InferProps<{
            getLayerDataSource: PropTypes.Validator<(...args: any[]) => any>;
            getBounds: PropTypes.Validator<(...args: any[]) => any>;
        }>>;
        design: PropTypes.Validator<object>;
        onDesignChange: PropTypes.Requireable<(...args: any[]) => any>;
        width: PropTypes.Requireable<number>;
        height: PropTypes.Requireable<number>;
        onRowClick: PropTypes.Requireable<(...args: any[]) => any>;
        extraFilters: PropTypes.Requireable<(PropTypes.InferProps<{
            table: PropTypes.Validator<string>;
            jsonql: PropTypes.Validator<object>;
        }> | null | undefined)[]>;
        scope: PropTypes.Requireable<PropTypes.InferProps<{
            name: PropTypes.Validator<string>;
            filter: PropTypes.Requireable<PropTypes.InferProps<{
                table: PropTypes.Validator<string>;
                jsonql: PropTypes.Validator<object>;
            }>>;
            data: PropTypes.Validator<PropTypes.InferProps<{
                layerViewId: PropTypes.Validator<string>;
                data: PropTypes.Requireable<any>;
            }>>;
        }>>;
        onScopeChange: PropTypes.Requireable<(...args: any[]) => any>;
        dragging: PropTypes.Requireable<boolean>;
        touchZoom: PropTypes.Requireable<boolean>;
        scrollWheelZoom: PropTypes.Requireable<boolean>;
        zoomLocked: PropTypes.Requireable<boolean>;
    };
    static contextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    constructor(props: any);
    componentDidMount(): any;
    componentDidUpdate(prevProps: any): any;
    performAutoZoom(): any;
    handleBoundsChange: (bounds: any) => any;
    handleGridClick: (layerViewId: any, ev: any) => any;
    getCompiledFilters(): any;
    renderLegend(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    renderPopup(): React.CElement<{
        header?: React.ReactNode;
        footer?: React.ReactNode;
        size?: "small" | "normal" | "full" | "large" | undefined;
        width?: number | undefined;
        showCloseX?: boolean | undefined;
        onClose?: (() => void) | undefined;
    }, ModalPopupComponent> | null;
    render(): React.DetailedReactHTMLElement<{
        style: {
            width: any;
            height: any;
            position: "relative";
        };
    }, HTMLElement>;
}

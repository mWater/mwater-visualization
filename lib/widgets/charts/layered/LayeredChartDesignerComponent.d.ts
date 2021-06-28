import React from "react";
import TabbedComponent from "react-library/lib/TabbedComponent";
declare const _default: {
    new (props: {} | Readonly<{}>): {
        areAxesLabelsNeeded(layer: any): boolean;
        updateDesign(changes: any): any;
        handleTypeChange: (type: any) => any;
        handleTransposeChange: (ev: any) => any;
        handleStackedChange: (ev: any) => any;
        handleProportionalChange: (ev: any) => any;
        handleLabelsChange: (ev: any) => any;
        handlePercentageVisibilityChange: (ev: any) => any;
        handlePolarOrderChange: (ev: any) => any;
        handleYThresholdsChange: (yThresholds: any) => any;
        handleLayerChange: (index: any, layer: any) => any;
        handleRemoveLayer: (index: any) => any;
        handleAddLayer: () => any;
        handleXAxisLabelTextChange: (ev: any) => any;
        handleYAxisLabelTextChange: (ev: any) => any;
        handleToggleXAxisLabelClick: (ev: any) => any;
        handleToggleYAxisLabelClick: (ev: any) => any;
        handleYMinChange: (yMin: any) => any;
        handleYMaxChange: (yMax: any) => any;
        renderLabels(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
        renderType(): React.CElement<{
            icon: string;
            label: string;
        }, React.Component<{
            icon: string;
            label: string;
        }, any, any>>;
        renderLayer: (index: any) => React.DetailedReactHTMLElement<{
            style: {
                paddingTop: number;
                paddingBottom: number;
            };
            key: any;
        }, HTMLElement>;
        renderLayers(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
        renderOptions(): React.DetailedReactHTMLElement<{
            className: string;
        }, HTMLElement> | undefined;
        renderThresholds(): React.CElement<{
            label: string;
        }, React.Component<{
            label: string;
        }, any, any>> | undefined;
        renderYRange(): React.CElement<{
            label: string;
        }, React.Component<{
            label: string;
        }, any, any>> | undefined;
        render(): React.CElement<{
            tabs: {
                id: string;
                label: React.ReactNode;
                elem: React.ReactNode;
                onRemove?: (() => void) | undefined;
            }[];
            initialTabId?: string | undefined;
            tabId?: string | undefined;
            onAddTab?: (() => void) | undefined;
            onTabClick?: ((tabId: string) => void) | undefined;
        }, TabbedComponent>;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<{}> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
    };
    new (props: {}, context: any): {
        areAxesLabelsNeeded(layer: any): boolean;
        updateDesign(changes: any): any;
        handleTypeChange: (type: any) => any;
        handleTransposeChange: (ev: any) => any;
        handleStackedChange: (ev: any) => any;
        handleProportionalChange: (ev: any) => any;
        handleLabelsChange: (ev: any) => any;
        handlePercentageVisibilityChange: (ev: any) => any;
        handlePolarOrderChange: (ev: any) => any;
        handleYThresholdsChange: (yThresholds: any) => any;
        handleLayerChange: (index: any, layer: any) => any;
        handleRemoveLayer: (index: any) => any;
        handleAddLayer: () => any;
        handleXAxisLabelTextChange: (ev: any) => any;
        handleYAxisLabelTextChange: (ev: any) => any;
        handleToggleXAxisLabelClick: (ev: any) => any;
        handleToggleYAxisLabelClick: (ev: any) => any;
        handleYMinChange: (yMin: any) => any;
        handleYMaxChange: (yMax: any) => any;
        renderLabels(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
        renderType(): React.CElement<{
            icon: string;
            label: string;
        }, React.Component<{
            icon: string;
            label: string;
        }, any, any>>;
        renderLayer: (index: any) => React.DetailedReactHTMLElement<{
            style: {
                paddingTop: number;
                paddingBottom: number;
            };
            key: any;
        }, HTMLElement>;
        renderLayers(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement> | undefined;
        renderOptions(): React.DetailedReactHTMLElement<{
            className: string;
        }, HTMLElement> | undefined;
        renderThresholds(): React.CElement<{
            label: string;
        }, React.Component<{
            label: string;
        }, any, any>> | undefined;
        renderYRange(): React.CElement<{
            label: string;
        }, React.Component<{
            label: string;
        }, any, any>> | undefined;
        render(): React.CElement<{
            tabs: {
                id: string;
                label: React.ReactNode;
                elem: React.ReactNode;
                onRemove?: (() => void) | undefined;
            }[];
            initialTabId?: string | undefined;
            tabId?: string | undefined;
            onAddTab?: (() => void) | undefined;
            onTabClick?: ((tabId: string) => void) | undefined;
        }, TabbedComponent>;
        context: any;
        setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callback?: (() => void) | undefined): void;
        readonly props: Readonly<{}> & Readonly<{
            children?: React.ReactNode;
        }>;
        state: Readonly<{}>;
        refs: {
            [key: string]: React.ReactInstance;
        };
        componentDidMount?(): void;
        shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean;
        componentWillUnmount?(): void;
        componentDidCatch?(error: Error, errorInfo: React.ErrorInfo): void;
        getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>): any;
        componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void;
        componentWillMount?(): void;
        UNSAFE_componentWillMount?(): void;
        componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<{}>, nextContext: any): void;
        componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
        UNSAFE_componentWillUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): void;
    };
    initClass(): void;
    contextType?: React.Context<any> | undefined;
};
export default _default;

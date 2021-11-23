"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetComponent = void 0;
const react_1 = require("react");
const WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
/**
 * Component which renders a widget and ensures that props do not change
 * unnecessarily.
 */
function WidgetComponent(props) {
    // Get and stabilize widget data source
    // TODO!!! There is a global problem with DashboardDataSources being re-created on each render.
    // TODO!!! This now only uses the type of the dashboard data source. They should be more stable in the future.
    const widgetDataSource = (0, react_1.useMemo)(() => props.dashboardDataSource.getWidgetDataSource(props.type, props.id), [props.dashboardDataSource.constructor, props.type, props.id, props.schema, props.dataSource, props.refreshKey]);
    const widget = WidgetFactory_1.default.createWidget(props.type);
    // Stabilize functions
    const onDesignChange = useStabilizeFunction(props.onDesignChange);
    const onRowClick = useStabilizeFunction(props.onRowClick) || undefined;
    const onScopeChange = useStabilizeFunction(props.onScopeChange);
    const widgetRef = useStabilizeFunction(props.widgetRef);
    // Stabilize values
    const filters = useStabilizeValue(props.filters);
    const scope = useStabilizeValue(props.scope);
    return widget.createViewElement({
        schema: props.schema,
        dataSource: props.dataSource,
        widgetDataSource,
        design: props.design,
        scope,
        filters,
        onScopeChange,
        onDesignChange,
        width: props.width,
        height: props.height,
        singleRowTable: props.singleRowTable,
        onRowClick,
        namedStrings: props.namedStrings,
        tocEntries: props.tocEntries,
        onScrollToTOCEntry: props.onScrollToTOCEntry,
        widgetRef
    });
}
exports.WidgetComponent = WidgetComponent;
/** Always returns the same function to prevent unnecessary re-rendering. Forwards to the real function */
function useStabilizeFunction(func) {
    // Create ref for changing func
    const variableRef = (0, react_1.useRef)();
    variableRef.current = func;
    // Create stable function to always use as callback
    function stableCallback(...args) {
        return variableRef.current.apply(null, args);
    }
    const stableRef = (0, react_1.useRef)(stableCallback);
    return func ? stableRef.current : undefined;
}
/** Always returns the same value of stringifies the same to prevent unnecessary re-rendering */
function useStabilizeValue(value) {
    const stableRef = (0, react_1.useRef)(value);
    if (JSON.stringify(value) != JSON.stringify(stableRef.current)) {
        stableRef.current = value;
    }
    return stableRef.current;
}

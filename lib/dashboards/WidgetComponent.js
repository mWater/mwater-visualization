"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetComponent = void 0;
var react_1 = require("react");
var WidgetFactory_1 = __importDefault(require("../widgets/WidgetFactory"));
/**
 * Component which renders a widget and ensures that props do not change
 * unnecessarily.
 */
function WidgetComponent(props) {
    // Get and stabilize widget data source
    // TODO!!! There is a global problem with DashboardDataSources being re-created on each render. 
    // TODO!!! This now only uses the type of the dashboard data source. They should be more stable in the future.
    var widgetDataSource = react_1.useMemo(function () { return props.dashboardDataSource.getWidgetDataSource(props.type, props.id); }, [props.dashboardDataSource.constructor, props.type, props.id]);
    var widget = WidgetFactory_1.default.createWidget(props.type);
    // Stabilize functions
    var onDesignChange = useStabilizeFunction(props.onDesignChange);
    var onRowClick = useStabilizeFunction(props.onRowClick) || undefined;
    var onScopeChange = useStabilizeFunction(props.onScopeChange);
    // Stabilize values
    var filters = useStabilizeValue(props.filters);
    var scope = useStabilizeValue(props.scope);
    return widget.createViewElement({
        schema: props.schema,
        dataSource: props.dataSource,
        widgetDataSource: widgetDataSource,
        design: props.design,
        scope: scope,
        filters: filters,
        onScopeChange: onScopeChange,
        onDesignChange: onDesignChange,
        width: props.width,
        height: props.height,
        singleRowTable: props.singleRowTable,
        onRowClick: onRowClick,
        namedStrings: props.namedStrings
    });
}
exports.WidgetComponent = WidgetComponent;
/** Always returns the same function to prevent unnecessary re-rendering. Forwards to the real function */
function useStabilizeFunction(func) {
    // Create ref for changing func
    var variableRef = react_1.useRef();
    variableRef.current = func;
    // Create stable function to always use as callback
    function stableCallback() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return variableRef.current.apply(null, args);
    }
    var stableRef = react_1.useRef(stableCallback);
    return func ? stableRef.current : undefined;
}
/** Always returns the same value of stringifies the same to prevent unnecessary re-rendering*/
function useStabilizeValue(value) {
    var stableRef = react_1.useRef(value);
    if (JSON.stringify(value) != JSON.stringify(stableRef.current)) {
        stableRef.current = value;
    }
    return stableRef.current;
}

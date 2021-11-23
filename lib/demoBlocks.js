"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const R = react_1.default.createElement;
const jquery_1 = __importDefault(require("jquery"));
const MWaterLoaderComponent_1 = __importDefault(require("./MWaterLoaderComponent"));
const BlocksDesignerComponent_1 = __importDefault(require("./layouts/blocks/BlocksDesignerComponent"));
const DirectWidgetDataSource_1 = __importDefault(require("./widgets/DirectWidgetDataSource"));
const WidgetFactory_1 = __importDefault(require("./widgets/WidgetFactory"));
class DemoComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            design,
            extraTables: []
        };
    }
    render() {
        return R(MWaterLoaderComponent_1.default, {
            apiUrl: this.props.apiUrl,
            client: this.props.client,
            user: this.props.user,
            onExtraTablesChange: (extraTables) => this.setState({ extraTables }),
            extraTables: this.state.extraTables
        }, (error, config) => {
            if (error) {
                alert("Error: " + error.message);
                return null;
            }
            const renderWidget = (options) => {
                // Passed
                //  type: type of the widget
                //  design: design of the widget
                //  onDesignChange: TODO
                //  width: width to render. null for auto
                //  height: height to render. null for auto
                const widget = WidgetFactory_1.default.createWidget(options.type);
                const widgetDataSource = new DirectWidgetDataSource_1.default({
                    apiUrl: this.props.apiUrl,
                    widget,
                    schema: config.schema,
                    dataSource: config.dataSource,
                    client: this.props.client
                });
                return react_1.default.cloneElement(widget.createViewElement({
                    schema: config.schema,
                    dataSource: config.dataSource,
                    widgetDataSource,
                    design: options.design,
                    onDesignChange: options.onDesignChange,
                    scope: null,
                    filters: [],
                    onScopeChange: () => alert("TODO")
                }), {
                    width: options.width,
                    height: widget.isAutoHeight() ? null : options.height
                });
            };
            return R(BlocksDesignerComponent_1.default, {
                renderWidget,
                design: this.state.design,
                onDesignChange: (design) => this.setState({ design })
            });
        });
    }
}
(0, jquery_1.default)(function () {
    const sample = R("div", { className: "container-fluid", style: { height: "100%", paddingLeft: 0, paddingRight: 0 } }, R("style", null, "html, body, #main { height: 100% }"), react_1.default.createElement(DemoComponent, { apiUrl: "https://api.mwater.co/v3/" }));
    return react_dom_1.default.render(sample, document.getElementById("main"));
});
const widgetDesign = {
    version: 1,
    layers: [
        {
            axes: {
                x: {
                    expr: {
                        type: "field",
                        table: "entities.water_point",
                        column: "type"
                    },
                    xform: null
                },
                y: {
                    expr: {
                        type: "id",
                        table: "entities.water_point"
                    },
                    aggr: "count",
                    xform: null
                }
            },
            filter: null,
            table: "entities.water_point"
        }
    ],
    type: "bar"
};
var design = {
    id: "root",
    type: "root",
    blocks: [
    // { id: "1234", type: "widget", aspectRatio: 1.4, widgetType: "LayeredChart", design: widgetDesign }
    // { id: "1234", type: "widget", widgetType: "Text", design: { items: ["hello world!!!"] } }
    ]
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ChartWidget_1 = __importDefault(require("./charts/ChartWidget"));
const LayeredChart_1 = __importDefault(require("./charts/layered/LayeredChart"));
const TableChart_1 = __importDefault(require("./charts/table/TableChart"));
const CalendarChart_1 = __importDefault(require("./charts/calendar/CalendarChart"));
const ImageMosaicChart_1 = __importDefault(require("./charts/imagemosaic/ImageMosaicChart"));
const PivotChart_1 = __importDefault(require("./charts/pivot/PivotChart"));
const MarkdownWidget_1 = __importDefault(require("./MarkdownWidget"));
const TextWidget_1 = __importDefault(require("./text/TextWidget"));
const ImageWidget_1 = __importDefault(require("./ImageWidget"));
const MapWidget_1 = __importDefault(require("./MapWidget"));
const IFrameWidget_1 = __importDefault(require("./IFrameWidget"));
const TOCWidget_1 = __importDefault(require("./TOCWidget"));
const widgetTypes = {
    LayeredChart: new ChartWidget_1.default(new LayeredChart_1.default()),
    TableChart: new ChartWidget_1.default(new TableChart_1.default()),
    CalendarChart: new ChartWidget_1.default(new CalendarChart_1.default()),
    ImageMosaicChart: new ChartWidget_1.default(new ImageMosaicChart_1.default()),
    PivotChart: new ChartWidget_1.default(new PivotChart_1.default()),
    Markdown: new MarkdownWidget_1.default(),
    Map: new MapWidget_1.default(),
    Text: new TextWidget_1.default(),
    Image: new ImageWidget_1.default(),
    IFrame: new IFrameWidget_1.default(),
    TOC: new TOCWidget_1.default()
};
// Creates widgets based on type
class WidgetFactory {
    static createWidget(type) {
        if (widgetTypes[type]) {
            return widgetTypes[type];
        }
        throw new Error(`Unknown widget type ${type}`);
    }
}
exports.default = WidgetFactory;

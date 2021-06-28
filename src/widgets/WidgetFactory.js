let WidgetFactory;
import ChartWidget from './charts/ChartWidget';
import LayeredChart from './charts/layered/LayeredChart';
import TableChart from './charts/table/TableChart';
import CalendarChart from './charts/calendar/CalendarChart';
import ImageMosaicChart from './charts/imagemosaic/ImageMosaicChart';
import PivotChart from './charts/pivot/PivotChart';
import MarkdownWidget from './MarkdownWidget';
import TextWidget from './text/TextWidget';
import ImageWidget from './ImageWidget';
import MapWidget from './MapWidget';
import IFrameWidget from './IFrameWidget';
import TOCWidget from './TOCWidget';

const widgetTypes = {
  LayeredChart: new ChartWidget(new LayeredChart()),
  TableChart: new ChartWidget(new TableChart()),
  CalendarChart: new ChartWidget(new CalendarChart()),
  ImageMosaicChart: new ChartWidget(new ImageMosaicChart()),
  PivotChart: new ChartWidget(new PivotChart()),
  Markdown: new MarkdownWidget(),
  Map: new MapWidget(),
  Text: new TextWidget(),
  Image: new ImageWidget(),
  IFrame: new IFrameWidget(),
  TOC: new TOCWidget()
};

// Creates widgets based on type 
export default WidgetFactory = class WidgetFactory {
  static createWidget(type) {
    if (widgetTypes[type]) {
      return widgetTypes[type];
    }
    throw new Error(`Unknown widget type ${type}`);
  }
};

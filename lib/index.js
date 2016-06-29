var $;

exports.CachingDataSource = require('./CachingDataSource');

exports.WidgetFactory = require('./widgets/WidgetFactory');

exports.UndoStack = require('./UndoStack');

exports.DashboardComponent = require('./widgets/DashboardComponent');

exports.BingLayer = require('./maps/BingLayer');

exports.UtfGridLayer = require('./maps/UtfGridLayer');

exports.LeafletMapComponent = require('./maps/LeafletMapComponent');

exports.LayerFactory = require('./maps/LayerFactory');

exports.MapViewComponent = require('./maps/MapViewComponent');

exports.MapDesignerComponent = require('./maps/MapDesignerComponent');

exports.MapComponent = require('./maps/MapComponent');

exports.VerticalLayoutComponent = require('./VerticalLayoutComponent');

exports.RadioButtonComponent = require('./RadioButtonComponent');

exports.CheckboxComponent = require('./CheckboxComponent');

exports.MWaterLoaderComponent = require('./MWaterLoaderComponent');

exports.LayeredChart = require('./widgets/charts/LayeredChart');

exports.TableChart = require('./widgets/charts/TableChart');

exports.CalendarChart = require('./widgets/charts/CalendarChart');

exports.ImageMosaicChart = require('./widgets/charts/ImageMosaicChart');

exports.ChartViewComponent = require('./widgets/charts/ChartViewComponent');

exports.MapViewComponent = require('./maps/MapViewComponent');

exports.DashboardUtils = require('./widgets/DashboardUtils');

exports.WidgetScoper = require('./widgets/WidgetScoper');

exports.WidgetScopesViewComponent = require('./widgets/WidgetScopesViewComponent');

exports.TableSelectComponent = require('./TableSelectComponent');

exports.AxisBuilder = require('./axes/AxisBuilder');

exports.DatagridComponent = require('./datagrids/DatagridComponent');

exports.DatagridDesignerComponent = require('./datagrids/DatagridDesignerComponent');

exports.DatagridUtils = require('./datagrids/DatagridUtils');

exports.ServerDashboardDataSource = require('./widgets/ServerDashboardDataSource');

exports.DirectDashboardDataSource = require('./widgets/DirectDashboardDataSource');

exports.DirectWidgetDataSource = require('./widgets/DirectWidgetDataSource');

exports.ServerMapUrlSource = require('./maps/ServerMapUrlSource');

exports.DirectMapUrlSource = require('./maps/DirectMapUrlSource');

require('./pathseg-polyfill.js');

$ = require('jquery');


$(document).on('show.bs.modal', '.modal', function () {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    setTimeout(function() {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
});
$(document).on('hidden.bs.modal', '.modal', function () {
    $('.modal:visible').length && $(document.body).addClass('modal-open');
});
;

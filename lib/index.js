var $;

exports.Schema = require('./Schema');

exports.LogicalExprComponent = require('./expressions/LogicalExprComponent');

exports.ExpressionBuilder = require('./expressions/ExpressionBuilder');

exports.ExpressionCompiler = require('./expressions/ExpressionCompiler');

exports.ScalarExprComponent = require('./expressions/ScalarExprComponent');

exports.DataSource = require('./DataSource');

exports.CachingDataSource = require('./CachingDataSource');

exports.WidgetFactory = require('./widgets/WidgetFactory');

exports.UndoStack = require('./UndoStack');

exports.DashboardComponent = require('./widgets/DashboardComponent');

exports.AutoSizeComponent = require('./AutoSizeComponent');

exports.BingLayer = require('./maps/BingLayer');

exports.UtfGridLayer = require('./maps/UtfGridLayer');

exports.LeafletMapComponent = require('./maps/LeafletMapComponent');

exports.LayerFactory = require('./maps/LayerFactory');

exports.MapViewComponent = require('./maps/MapViewComponent');

exports.MapDesignerComponent = require('./maps/MapDesignerComponent');

exports.MapComponent = require('./maps/MapComponent');

exports.LargeListComponent = require('./LargeListComponent');

exports.VerticalLayoutComponent = require('./VerticalLayoutComponent');

exports.ModalComponent = require('./ModalComponent');

exports.ActionCancelModalComponent = require('./ActionCancelModalComponent');

exports.RadioButtonComponent = require('./RadioButtonComponent');

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

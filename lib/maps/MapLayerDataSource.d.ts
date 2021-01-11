import { JsonQLFilter } from "../JsonQLFilter";
import { WidgetDataSource } from "../widgets/WidgetDataSource";
/** Data source for a layer of a map. Gives urls, popup data */
export interface MapLayerDataSource {
    /** Get the url for the image tiles with the specified filters applied
     * Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
     * Only called on layers that are valid */
    getTileUrl(design: any, filters: JsonQLFilter[]): string | null;
    /** Get the url for the interactivity tiles with the specified filters applied
     * Called with (design, filters) where design is the design of the layer and filters are filters to apply. Returns URL
     * Only called on layers that are valid */
    getUtfGridUrl(design: any, filters: JsonQLFilter[]): string | null;
    /** Get the url for vector tile source with an expiry time. Only for layers of type "VectorTile"
     * @param createdAfter ISO 8601 timestamp requiring that tile source on server is created after specified datetime
     */
    getVectorTileUrl(layerDesign: any, filters: JsonQLFilter[], createdAfter: string): Promise<{
        url: string;
        expires: string;
    }>;
    /** Gets widget data source for a popup widget */
    getPopupWidgetDataSource(design: any, widgetId: string): WidgetDataSource;
}

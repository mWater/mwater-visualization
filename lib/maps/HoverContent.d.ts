import React from "react";
import { DataSource, Schema } from "mwater-expressions";
import { JsonQLFilter } from "..";
export interface HoverContentProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** Design of the marker layer */
    design: any;
    filters?: JsonQLFilter[];
}
declare const HoverContent: React.FC<HoverContentProps>;
export default HoverContent;

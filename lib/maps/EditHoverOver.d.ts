import { DataSource, Schema } from "mwater-expressions";
import React from "react";
export interface EditHoverOverProps {
    /** Schema to use */
    schema: Schema;
    dataSource: DataSource;
    /** Design of the marker layer */
    design: any;
    /** Called with new design */
    onDesignChange: any;
    /** Table that popup is for */
    table: string;
    /** Table of the row that join is to. Usually same as table except for choropleth maps */
    idTable: string;
    defaultPopupFilterJoins: any;
}
declare const EditHoverOver: React.FC<EditHoverOverProps>;
export default EditHoverOver;

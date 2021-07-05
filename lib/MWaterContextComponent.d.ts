import PropTypes from "prop-types";
import React from "react";
import { Schema } from "mwater-expressions";
/** Creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
 * and several other context items
 */
export default class MWaterContextComponent extends React.Component<{
    apiUrl: string;
    client?: string;
    /**  user id of logged in user */
    user?: string;
    schema: Schema;
    /**  Extra tables to load in schema. Forms are not loaded by default as they are too many */
    extraTables?: string[];
    /**  Called when extra tables are changed and schema will be reloaded */
    onExtraTablesChange?: (extraTables: string[]) => void;
    /**  Override default add layer component. See AddLayerComponent for details */
    addLayerElementFactory?: any;
}> {
    static childContextTypes: {
        tableSelectElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
        addLayerElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
        globalFiltersElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
        decorateScalarExprTreeSectionChildren: PropTypes.Requireable<(...args: any[]) => any>;
        isScalarExprTreeSectionInitiallyOpen: PropTypes.Requireable<(...args: any[]) => any>;
        isScalarExprTreeSectionMatch: PropTypes.Requireable<(...args: any[]) => any>;
    };
    getChildContext(): any;
    handleAddTable: (table: any) => void;
    render(): React.ReactNode;
}

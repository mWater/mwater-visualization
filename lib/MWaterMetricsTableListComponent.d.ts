import { Schema } from "mwater-expressions";
/** Searchable list of metric tables */
export declare const MWaterMetricsTableListComponent: (props: {
    apiUrl: string;
    schema: Schema;
    client?: string | undefined;
    /** User id */
    user?: string | undefined;
    /** Called with table selected */
    onChange: (tableId: string | null) => void;
    extraTables: string[];
    onExtraTableAdd: (tableId: string) => void;
    onExtraTableRemove: (tableId: string) => void;
    /** e.g. "en" */
    locale?: string | undefined;
}) => JSX.Element;

import { DataDrivenPropertyValueSpecification } from "maplibre-gl";
import { Axis } from "../axes/Axis";
/** Compile a color mapped axis to mapbox format case statement */
export declare function compileColorMapToMapbox(axis: Axis | null | undefined, defaultColor: string): DataDrivenPropertyValueSpecification<string> | string;
/** Compile a color that is transparent if excluded to mapbox format case statement */
export declare function compileColorToMapbox(color: string, excludedValues?: any[]): DataDrivenPropertyValueSpecification<string> | string;

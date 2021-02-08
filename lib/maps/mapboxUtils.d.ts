import { Expression } from "mapbox-gl";
import { Axis } from "../axes/Axis";
/** Compile a color mapped axis to mapbox format case statement */
export declare function compileColorMapToMapbox(axis: Axis | undefined, defaultColor: string): string | Expression;

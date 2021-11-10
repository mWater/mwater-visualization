export default class LegoLayoutEngine {
    width: any;
    blocksAcross: any;
    scale: number;
    constructor(width: any, blocksAcross: any);
    calculateHeight(layouts: any): number;
    getLayoutBounds(layout: any): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    rectToLayout(rect: any): {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    performLayout(layouts: any, priority: any): {};
    appendLayout(layouts: any, w: any, h: any): {
        x: number;
        y: number;
        w: any;
        h: any;
    };
    overlaps(a: any, b: any): boolean;
    shiftLayout(layout: any): {
        x: any;
        y: any;
        w: any;
        h: any;
    };
}

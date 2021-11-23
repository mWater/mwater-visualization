import React from "react";
import Widget, { CreateViewElementOptions } from "./Widget";
export default class IFrameWidget extends Widget {
    createViewElement(options: CreateViewElementOptions): React.CElement<{
        design: object;
        onDesignChange: ((design: object) => void) | null | undefined;
        width: number | undefined;
        height: number | undefined;
    }, React.Component<{
        design: object;
        onDesignChange: ((design: object) => void) | null | undefined;
        width: number | undefined;
        height: number | undefined;
    }, any, any>>;
    isAutoHeight(): boolean;
}

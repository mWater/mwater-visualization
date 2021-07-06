import React from "react";
import Widget from "./Widget";
export default class IFrameWidget extends Widget {
    createViewElement(options: any): React.CElement<{
        design: any;
        onDesignChange: any;
        width: any;
        height: any;
    }, React.Component<{
        design: any;
        onDesignChange: any;
        width: any;
        height: any;
    }, any, any>>;
    isAutoHeight(): boolean;
}

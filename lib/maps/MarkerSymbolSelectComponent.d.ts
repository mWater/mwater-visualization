import React from "react";
interface MarkerSymbolSelectComponentProps {
    symbol?: string;
    onChange: any;
}
export default class MarkerSymbolSelectComponent extends React.Component<MarkerSymbolSelectComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        className: string;
    }, HTMLElement>;
}
export {};
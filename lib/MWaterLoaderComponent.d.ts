/// <reference types="jquery" />
import React from "react";
import LoadingComponent from "react-library/lib/LoadingComponent";
declare const _default: {
    new (props: any): {
        isLoadNeeded(newProps: any, oldProps: any): boolean;
        load(props: any, prevProps: any, callback: any): JQuery.jqXHR<any>;
        render(): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> | React.CElement<{
            width?: string | number | undefined;
            height?: string | number | undefined;
            label?: React.ReactNode;
        }, LoadingComponent>;
    };
    initClass(): void;
    contextType?: React.Context<any> | undefined;
};
export default _default;

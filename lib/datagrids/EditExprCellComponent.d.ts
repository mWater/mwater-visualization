import React from "react";
import { DataSource, EnumValue, Schema } from "mwater-expressions";
export interface EditExprCellComponentProps {
    /** schema to use */
    schema: Schema;
    /** dataSource to use */
    dataSource: DataSource;
    /** Locale to use */
    locale?: string;
    width: number;
    height: number;
    value?: any;
    expr: any;
    /** Called when save is requested (e.g. enter in text box) */
    onSave: any;
    onCancel: any;
}
interface EditExprCellComponentState {
    value: any;
}
export default class EditExprCellComponent extends React.Component<EditExprCellComponentProps, EditExprCellComponentState> {
    constructor(props: any);
    getValue(): any;
    hasChanged(): boolean;
    handleChange: (value: any) => void;
    render(): React.CElement<TextEditComponentProps, TextEditComponent> | React.CElement<EnumEditComponentProps, EnumEditComponent>;
}
interface TextEditComponentProps {
    value?: any;
    /** Called with new value */
    onChange: any;
    /** Called when enter is pressed */
    onSave: any;
    onCancel: any;
}
declare class TextEditComponent extends React.Component<TextEditComponentProps> {
    input: HTMLInputElement | null;
    componentDidMount(): void | undefined;
    render(): React.DetailedReactHTMLElement<{
        style: {
            paddingTop: number;
        };
    }, HTMLElement>;
}
interface EnumEditComponentProps {
    value?: any;
    enumValues: EnumValue[];
    /** Locale to use */
    locale?: string;
    /** Called with new value */
    onChange: any;
    /** Called when enter is pressed */
    onSave: any;
    onCancel: any;
}
declare class EnumEditComponent extends React.Component<EnumEditComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            paddingTop: number;
        };
    }, HTMLElement>;
}
export {};

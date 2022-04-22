import React from "react";
import { DataSource, EnumValue, Expr, Schema } from "mwater-expressions";
export interface EditExprCellComponentProps {
    /** schema to use */
    schema: Schema;
    /** dataSource to use */
    dataSource: DataSource;
    /** Locale to use */
    locale?: string;
    /** Size of control */
    width: number;
    height: number;
    /** Expression being edited */
    expr: Expr;
    /** Value of expression */
    value?: any;
    /** Called when save is requested (e.g. enter in text box) */
    onSave: () => void;
    /** Called when cancel is requested (e.g. esc in text box) */
    onCancel: () => void;
}
interface EditExprCellComponentState {
    value: any;
}
export default class EditExprCellComponent extends React.Component<EditExprCellComponentProps, EditExprCellComponentState> {
    constructor(props: any);
    getValue(): any;
    hasChanged(): boolean;
    handleChange: (value: any) => void;
    render(): React.CElement<TextEditComponentProps, TextEditComponent> | React.CElement<EnumEditComponentProps, EnumEditComponent> | React.FunctionComponentElement<{
        /** Current value */
        value?: any;
        /** Called with new value */
        onChange: (value: any) => void;
        /** Called when save is requested (e.g. enter in text box) */
        onSave: () => void;
        /** Called when cancel is requested (e.g. esc in text box) */
        onCancel: () => void;
        /** True if datetime, not date */
        datetime: boolean;
    }>;
}
interface TextEditComponentProps {
    /** Current value */
    value?: any;
    /** Called with new value */
    onChange: (value: any) => void;
    /** Called when save is requested (e.g. enter in text box) */
    onSave: () => void;
    /** Called when cancel is requested (e.g. esc in text box) */
    onCancel: () => void;
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
    /** Current value */
    value?: any;
    /** Called with new value */
    onChange: (value: any) => void;
    enumValues: EnumValue[];
    /** Locale to use */
    locale?: string;
    /** Called when save is requested (e.g. enter in text box) */
    onSave: () => void;
    /** Called when cancel is requested (e.g. esc in text box) */
    onCancel: () => void;
}
declare class EnumEditComponent extends React.Component<EnumEditComponentProps> {
    render(): React.DetailedReactHTMLElement<{
        style: {
            paddingTop: number;
        };
    }, HTMLElement>;
}
export {};

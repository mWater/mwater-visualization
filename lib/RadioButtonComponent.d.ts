import React from "react";
interface RadioButtonComponentProps {
    /** True to check */
    checked?: boolean;
    /** Called when clicked */
    onClick?: any;
    onChange?: any;
}
export default class RadioButtonComponent extends React.Component<RadioButtonComponentProps> {
    handleClick: () => any;
    render(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: () => any;
    }, HTMLElement>;
}
export {};

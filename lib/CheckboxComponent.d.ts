import React from "react";
export interface CheckboxComponentProps {
    /** True to check */
    checked?: boolean;
    /** Called when clicked */
    onClick?: any;
    onChange?: any;
}
export default class CheckboxComponent extends React.Component<CheckboxComponentProps> {
    handleClick: () => any;
    render(): React.DetailedReactHTMLElement<{
        className: string;
        onClick: () => any;
    }, HTMLElement>;
}

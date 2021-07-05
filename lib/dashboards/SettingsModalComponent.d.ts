import PropTypes from "prop-types";
import React from "react";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
interface SettingsModalComponentProps {
    onDesignChange: any;
    schema: any;
    dataSource: any;
}
interface SettingsModalComponentState {
    design: any;
}
export default class SettingsModalComponent extends React.Component<SettingsModalComponentProps, SettingsModalComponentState> {
    static contextTypes: {
        globalFiltersElementFactory: PropTypes.Requireable<(...args: any[]) => any>;
    };
    constructor(props: any);
    show(design: any): void;
    handleSave: () => void;
    handleCancel: () => void;
    handleDesignChange: (design: any) => void;
    handleFiltersChange: (filters: any) => void;
    handleGlobalFiltersChange: (globalFilters: any) => void;
    render(): React.CElement<{
        title?: React.ReactNode;
        actionLabel?: React.ReactNode;
        cancelLabel?: React.ReactNode;
        deleteLabel?: React.ReactNode;
        onAction?: (() => void) | undefined;
        onCancel?: (() => void) | undefined;
        onDelete?: (() => void) | undefined;
        size?: "full" | "large" | undefined;
        actionBusy?: boolean | undefined;
    }, ActionCancelModalComponent> | null;
}
export {};

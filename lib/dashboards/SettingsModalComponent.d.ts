import PropTypes from "prop-types";
import React from "react";
import ActionCancelModalComponent from "react-library/lib/ActionCancelModalComponent";
import { DataSource, Schema } from "mwater-expressions";
export interface SettingsModalComponentProps {
    onDesignChange: any;
    schema: Schema;
    dataSource: DataSource;
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
    render(): React.CElement<import("react-library/lib/ActionCancelModalComponent").ActionCancelModalComponentProps, ActionCancelModalComponent> | null;
}
export {};

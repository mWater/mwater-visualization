import { ReactNode } from "react";
import { DashboardDesign } from "./DashboardDesign";
export declare function LayoutOptionsComponent(props: {
    design: DashboardDesign;
    onDesignChange: (design: DashboardDesign) => void;
    onClose: () => void;
    /** Dashboard view to preview*/
    dashboardView: ReactNode;
    /** Quickfilters to preview */
    quickfiltersView: ReactNode;
}): JSX.Element;

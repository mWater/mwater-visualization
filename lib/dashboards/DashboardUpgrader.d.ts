export default class DashboardUpgrader {
    upgrade(design: any): {
        items: {
            id: string;
            type: string;
            blocks: never[];
        };
        layout: string;
        style: string;
    };
}

declare const _default: {
    new (options: any): {
        performQuery(query: any, cb: any): any;
        getImageUrl(imageId: string, height?: number | undefined): string;
        clearCache(): void;
        getCacheExpiry(): number;
    };
};
export default _default;

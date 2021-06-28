import React from "react";
interface ImagelistCarouselComponentProps {
    /** Array of { id, cover: true/false } */
    imagelist?: any;
    widgetDataSource: any;
    height?: number;
}
interface ImagelistCarouselComponentState {
    activeImage: any;
}
export default class ImagelistCarouselComponent extends React.Component<ImagelistCarouselComponentProps, ImagelistCarouselComponentState> {
    constructor(props: any);
    handleLeft: () => void;
    handleRight: () => void;
    renderImage(img: any, i: any, imageManager: any): React.DetailedReactHTMLElement<{
        className: string;
        style: {
            height: number | undefined;
        };
    }, HTMLElement>;
    renderImages(imageManager: any): any;
    render(): React.DetailedReactHTMLElement<{
        className: string;
        style: {
            height: number | undefined;
        };
    }, HTMLElement> | null;
}
export {};

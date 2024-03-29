import React from "react";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
export interface ImagePopupComponentProps {
    imageManager: any;
}
interface ImagePopupComponentState {
    image: any;
    url: any;
}
export default class ImagePopupComponent extends React.Component<ImagePopupComponentProps, ImagePopupComponentState> {
    constructor(props: any);
    show(image: any): any;
    render(): React.CElement<import("react-library/lib/ModalWindowComponent").ModalWindowComponentProps, ModalWindowComponent> | null;
}
export {};

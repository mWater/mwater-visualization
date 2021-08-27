import React from "react";
import ModalWindowComponent from "react-library/lib/ModalWindowComponent";
interface ImagePopupComponentProps {
    imageManager: any;
}
interface ImagePopupComponentState {
    image: any;
    url: any;
}
export default class ImagePopupComponent extends React.Component<ImagePopupComponentProps, ImagePopupComponentState> {
    constructor(props: any);
    show(image: any): any;
    render(): React.CElement<{
        isOpen: boolean;
        onRequestClose?: (() => void) | undefined;
        backgroundColor?: string | undefined;
        outerPadding?: number | undefined;
        innerPadding?: number | undefined;
    }, ModalWindowComponent> | null;
}
export {};

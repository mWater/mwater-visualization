import { DataSource } from "mwater-expressions";
import React from "react";
export interface ImageUploaderComponentProps {
    /** Data source to use for chart */
    dataSource: DataSource;
    /** callback for when upload is successful */
    onUpload: any;
    uid?: string;
}
interface ImageUploaderComponentState {
    uid: any;
    uploading: any;
    editing: any;
    files: File[] | null;
}
export default class ImageUploaderComponent extends React.Component<ImageUploaderComponentProps, ImageUploaderComponentState> {
    progressBar: HTMLDivElement | null;
    xhr: XMLHttpRequest;
    constructor(props: any);
    onFileDrop: (files: any) => void;
    uploadProgress: (e: any) => string | undefined;
    uploadComplete: (e: any) => any;
    createId(): string;
    renderUploader(): JSX.Element;
    renderPreview(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    handleChangeImage: () => void;
    render(): React.DetailedReactHTMLElement<React.HTMLAttributes<HTMLElement>, HTMLElement>;
}
export {};

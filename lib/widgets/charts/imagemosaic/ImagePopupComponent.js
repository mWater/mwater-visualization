"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const ModalWindowComponent_1 = __importDefault(require("react-library/lib/ModalWindowComponent"));
const RotationAwareImageComponent_1 = __importDefault(require("mwater-forms/lib/RotationAwareImageComponent"));
// Displays an image in a popup
class ImagePopupComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = {
            image: null,
            url: null
        };
    }
    // Shows image object
    show(image) {
        return this.props.imageManager.getImageUrl(image.id, (url) => {
            return this.setState({ image, url });
        });
    }
    render() {
        if (!this.state.image || !this.state.url) {
            return null;
        }
        return R(ModalWindowComponent_1.default, {
            isOpen: true,
            onRequestClose: () => this.setState({ image: null, url: null })
        }, R(RotationAwareImageComponent_1.default, {
            imageManager: this.props.imageManager,
            image: this.state.image
        }));
    }
}
exports.default = ImagePopupComponent;

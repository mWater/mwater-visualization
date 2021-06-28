"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
// Carousel component for images. Starts with cover photo
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const RotationAwareImageComponent_1 = __importDefault(require("mwater-forms/lib/RotationAwareImageComponent"));
// Bootstrap carousel for an image list
class ImagelistCarouselComponent extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.handleLeft = () => {
            if (this.props.imagelist && this.props.imagelist.length > 0) {
                const activeImage = (this.state.activeImage - 1 + this.props.imagelist.length) % this.props.imagelist.length;
                return this.setState({ activeImage });
            }
        };
        this.handleRight = () => {
            if (this.props.imagelist && this.props.imagelist.length > 0) {
                const activeImage = (this.state.activeImage + 1 + this.props.imagelist.length) % this.props.imagelist.length;
                return this.setState({ activeImage });
            }
        };
        this.state = {
            activeImage: lodash_1.default.findIndex(this.props.imagelist, { cover: true })
        };
        if (this.state.activeImage < 0) {
            this.state.activeImage = 0;
        }
    }
    renderImage(img, i, imageManager) {
        return R("div", { className: `item ${i === this.state.activeImage ? "active" : ""}`, style: { height: this.props.height } }, R(RotationAwareImageComponent_1.default, { imageManager, image: img }));
    }
    renderImages(imageManager) {
        return this.props.imagelist.map((imageObj, i) => this.renderImage(imageObj, i, imageManager));
    }
    render() {
        const imageManager = {
            getImageThumbnailUrl: (id, success, error) => success(this.props.widgetDataSource.getImageUrl(id, 100)),
            getImageUrl: (id, success, error) => success(this.props.widgetDataSource.getImageUrl(id, 640))
        };
        if (this.props.imagelist.length === 1) {
            return this.renderImage(this.props.imagelist[0], 0, imageManager);
        }
        if (this.props.imagelist.length === 0) {
            return null;
        }
        return R("div", {
            className: "image-carousel-component carousel slide",
            style: { height: this.props.height, overflow: "hidden" }
        }, this.props.imagelist.length < 10
            ? R("ol", { className: "carousel-indicators" }, lodash_1.default.map(this.props.imagelist, (img, i) => {
                return R("li", { className: i === this.state.activeImage ? "active" : undefined });
            }))
            : undefined, 
        // Wrapper for slides
        R("div", { className: "carousel-inner" }, this.renderImages(imageManager)), R("a", { className: "left carousel-control" }, R("span", { className: "glyphicon glyphicon-chevron-left", onClick: this.handleLeft })), R("a", { className: "right carousel-control" }, R("span", { className: "glyphicon glyphicon-chevron-right", onClick: this.handleRight })));
    }
}
exports.default = ImagelistCarouselComponent;

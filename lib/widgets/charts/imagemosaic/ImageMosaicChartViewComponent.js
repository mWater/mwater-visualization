"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const react_lazy_load_image_component_1 = require("react-lazy-load-image-component");
const RotationAwareImageComponent_1 = __importDefault(require("mwater-forms/lib/RotationAwareImageComponent"));
const ImagePopupComponent_1 = __importDefault(require("./ImagePopupComponent"));
/** creates a d3 calendar visualization */
class ImageMosaicChartViewComponent extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.handleClick = (primaryKey, image) => {
            var _a;
            if (this.props.onRowClick) {
                return this.props.onRowClick(this.props.design.table, primaryKey);
            }
            else {
                return (_a = this.imagePopup) === null || _a === void 0 ? void 0 : _a.show(image);
            }
        };
        // Render a single image
        this.renderImage = (primaryKey, image, imageManager) => {
            return R(react_lazy_load_image_component_1.LazyLoadComponent, { key: image.id }, R(RotationAwareImageComponent_1.default, {
                imageManager,
                image,
                thumbnail: true,
                height: 120,
                width: 80,
                onClick: () => this.handleClick(primaryKey, image)
            }));
        };
    }
    shouldComponentUpdate(prevProps) {
        return !lodash_1.default.isEqual(prevProps, this.props);
    }
    // Render images
    renderImages(imageManager) {
        const imageElems = [];
        // For each image
        return (() => {
            const result = [];
            for (var row of this.props.data) {
                let imageObj = row.image;
                // Ignore nulls (https://github.com/mWater/mwater-server/issues/202)
                if (!imageObj) {
                    continue;
                }
                if (lodash_1.default.isString(imageObj)) {
                    imageObj = JSON.parse(imageObj);
                }
                if (lodash_1.default.isArray(imageObj)) {
                    result.push(imageObj.map((image) => this.renderImage(row.id, image, imageManager)));
                }
                else {
                    result.push(this.renderImage(row.id, imageObj, imageManager));
                }
            }
            return result;
        })();
    }
    render() {
        const titleStyle = {
            textAlign: "center",
            fontSize: "14px",
            fontWeight: "bold"
        };
        const style = {
            width: this.props.width,
            height: this.props.height,
            position: "relative",
            overflowY: "auto"
        };
        const title = this.props.design.titleText;
        const imageManager = {
            getImageThumbnailUrl: (id, success, error) => success(this.props.dataSource.getImageUrl(id, 100)),
            getImageUrl: (id, success, error) => success(this.props.dataSource.getImageUrl(id))
        };
        return R("div", { style, className: "image-mosaic" }, title ? R("p", { style: titleStyle }, title) : undefined, R(ImagePopupComponent_1.default, {
            ref: (c) => {
                this.imagePopup = c;
            },
            imageManager
        }), R("div", null, this.renderImages(imageManager)));
    }
}
exports.default = ImageMosaicChartViewComponent;

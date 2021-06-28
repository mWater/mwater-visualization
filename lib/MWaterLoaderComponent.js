"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
let MWaterLoaderComponent;
const prop_types_1 = __importDefault(require("prop-types"));
const lodash_1 = __importDefault(require("lodash"));
const react_1 = __importDefault(require("react"));
const R = react_1.default.createElement;
const AsyncLoadComponent_1 = __importDefault(require("react-library/lib/AsyncLoadComponent"));
const LoadingComponent_1 = __importDefault(require("react-library/lib/LoadingComponent"));
const mWaterLoader_1 = __importDefault(require("./mWaterLoader"));
const MWaterContextComponent_1 = __importDefault(require("./MWaterContextComponent"));
// Loads an mWater schema from the server and creates child with schema and dataSource
// Also creates a tableSelectElementFactory context to allow selecting of a table in an mWater-friendly way
// and several other context items
exports.default = MWaterLoaderComponent = (function () {
    MWaterLoaderComponent = class MWaterLoaderComponent extends AsyncLoadComponent_1.default {
        static initClass() {
            this.propTypes = {
                apiUrl: prop_types_1.default.string.isRequired,
                client: prop_types_1.default.string,
                share: prop_types_1.default.string,
                user: prop_types_1.default.string,
                asUser: prop_types_1.default.string,
                extraTables: prop_types_1.default.arrayOf(prop_types_1.default.string),
                onExtraTablesChange: prop_types_1.default.func,
                // Override default add layer component. See AddLayerComponent for details
                addLayerElementFactory: prop_types_1.default.func,
                children: prop_types_1.default.func.isRequired,
                errorFormatter: prop_types_1.default.func
            };
            // Custom error formatter that returns React node or string, gets passed the error response from server
        }
        constructor(props) {
            super(props);
            this.state = {
                error: null,
                schema: null,
                dataSource: null
            };
            this.mounted = false;
        }
        // Override to determine if a load is needed. Not called on mounting
        isLoadNeeded(newProps, oldProps) {
            return !lodash_1.default.isEqual(lodash_1.default.pick(newProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"), lodash_1.default.pick(oldProps, "apiUrl", "client", "user", "share", "asUser", "extraTables"));
        }
        // Call callback with state changes
        load(props, prevProps, callback) {
            // Load schema and data source
            return mWaterLoader_1.default({
                apiUrl: props.apiUrl,
                client: props.client,
                share: props.share,
                asUser: props.asUser,
                extraTables: props.extraTables
            }, (error, config) => {
                if (error) {
                    const defaultError = `Cannot load one of the forms that this depends on. Perhaps the administrator has not shared the form with you? Details: ${error.message}`;
                    if (this.props.errorFormatter) {
                        return callback({ error: this.props.errorFormatter(JSON.parse(error.message), defaultError) });
                    }
                    return callback({ error: defaultError });
                }
                return callback({ schema: config.schema, dataSource: config.dataSource });
            });
        }
        render() {
            if (!this.state.schema && !this.state.error) {
                return react_1.default.createElement(LoadingComponent_1.default);
            }
            // Inject context
            return R(MWaterContextComponent_1.default, {
                apiUrl: this.props.apiUrl,
                client: this.props.client,
                user: this.props.user,
                schema: this.state.schema,
                extraTables: this.props.extraTables,
                onExtraTablesChange: this.props.onExtraTablesChange,
                addLayerElementFactory: this.props.addLayerElementFactory
            }, this.props.children(this.state.error, {
                schema: this.state.schema,
                dataSource: this.state.dataSource
            }));
        }
    };
    MWaterLoaderComponent.initClass();
    return MWaterLoaderComponent;
})();

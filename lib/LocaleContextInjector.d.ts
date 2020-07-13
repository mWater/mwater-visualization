import React from "react";
import PropTypes from 'prop-types';
/** Adds the locale to the context */
export default class LocaleContextInjector extends React.Component<{
    locale: string;
}> {
    static childContextTypes: {
        locale: PropTypes.Requireable<string>;
    };
    getChildContext(): {
        locale: string;
    };
    render(): React.ReactNode;
}

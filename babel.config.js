const tscOption = {
    //isTSX: false,
    allExtensions: false,
    allowNamespaces: true,
    allowDeclareFields: true,
    onlyRemoveTypeImports: true,
};
const envOption = {
    targets: {
        node: "current",
    },
    useBuiltIns: "usage",
    bugfixes: true,
    corejs: {
        version: 3,
        proposals: true,
    },
};
const aliasOption = {
    root: [
        "./src",
    ],
    alias: {
        src: "./src",
    },
};
const decoratorsOption = {
    legacy: true,
};
const classPropertiesOption = {
    loose: true,
};
const privatePropertyInObjectOtion = {
    loose: true,
};
const privatePropertyMethodsOption = {
    loose: true,
};

module.exports = {
    presets: [
        ["@babel/preset-env", envOption],
    ],
    plugins: [
        ["module-resolver", aliasOption],
        ["@babel/plugin-proposal-decorators", decoratorsOption],
        ["@babel/plugin-proposal-class-properties", classPropertiesOption],
        ["@babel/plugin-proposal-private-property-in-object", privatePropertyInObjectOtion],
        ["@babel/plugin-proposal-private-methods", privatePropertyMethodsOption]
    ],
};

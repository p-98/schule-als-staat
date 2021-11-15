/*
slightly modified from https://github.com/pruge/pug-tsx
because loader does not support double quotes imports and css imports
*/

module.exports = require("./dist/preprocessor").preprocessor;

module.exports.transform = require("./dist/preprocessor").transform;
module.exports.setOptions = require("./dist/preprocessor").setOptions;

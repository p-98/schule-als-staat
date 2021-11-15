"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_OPTIONS = void 0;
exports.DEFAULT_OPTIONS = {
    includes: ['jsx', 'React'],
    start: ['pug`', 'css`', '[ [({]`[^;,}\\]]'],
    end: '`',
    replace: {
        jsx: '/** @jsx jsx */ jsx;',
    },
    pattern: {
        start: '',
        end: '',
    },
};

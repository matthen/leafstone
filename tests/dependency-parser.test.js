/**
 * @fileoverview Tests for dependency parsing functionality.
 */

const { extractDependencies } = require('../lib/dependency-parser');

describe('extractDependencies', () => {
    test('should extract dependency with version', () => {
        const jsxContent = `
// @requires lodash@4.17.21
import _ from 'lodash';

function MyComponent() {
  return <div>{_.capitalize('hello')}</div>;
}
`;

        const result = extractDependencies(jsxContent);
        expect(result).toEqual({
            lodash: '4.17.21',
        });
    });

    test('should extract dependency without version (latest)', () => {
        const jsxContent = `
// @requires moment
import moment from 'moment';

function MyComponent() {
  return <div>{moment().format()}</div>;
}
`;

        const result = extractDependencies(jsxContent);
        expect(result).toEqual({
            moment: 'latest',
        });
    });

    test('should extract multiple dependencies', () => {
        const jsxContent = `
// @requires lodash@4.17.21
// @requires moment
// @requires axios@^1.0.0
import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';

function MyComponent() {
  return <div>Multiple deps</div>;
}
`;

        const result = extractDependencies(jsxContent);
        expect(result).toEqual({
            lodash: '4.17.21',
            moment: 'latest',
            axios: '^1.0.0',
        });
    });

    test('should handle scoped packages', () => {
        const jsxContent = `
// @requires @types/node@^18.0.0
// @requires @babel/core@7.20.0
import type { Process } from 'node:process';

function MyComponent() {
  return <div>Scoped packages</div>;
}
`;

        const result = extractDependencies(jsxContent);
        expect(result).toEqual({
            '@types/node': '^18.0.0',
            '@babel/core': '7.20.0',
        });
    });

    test('should handle complex version patterns', () => {
        const jsxContent = `
// @requires react@>=18.0.0
// @requires express@~4.18.2
// @requires typescript@^5.0.0-beta
function MyComponent() {
  return <div>Complex versions</div>;
}
`;

        const result = extractDependencies(jsxContent);
        expect(result).toEqual({
            react: '>=18.0.0',
            express: '~4.18.2',
            typescript: '^5.0.0-beta',
        });
    });

    test('should ignore comments that are not @requires', () => {
        const jsxContent = `
// This is a regular comment
// @todo Fix this later
// @requires lodash@4.17.21
// Some other comment
/* @requires moment */
function MyComponent() {
  return <div>Only line comments work</div>;
}
`;

        const result = extractDependencies(jsxContent);
        expect(result).toEqual({
            lodash: '4.17.21',
        });
    });

    test('should return empty object when no dependencies found', () => {
        const jsxContent = `
import React from 'react';

function MyComponent() {
  return <div>No dependencies</div>;
}
`;

        const result = extractDependencies(jsxContent);
        expect(result).toEqual({});
    });

    test('should handle dependencies with @ in package name correctly', () => {
        const jsxContent = `
// @requires @emotion/react@^11.0.0
// @requires @testing-library/react@^13.0.0
function MyComponent() {
  return <div>Scoped with versions</div>;
}
`;

        const result = extractDependencies(jsxContent);
        expect(result).toEqual({
            '@emotion/react': '^11.0.0',
            '@testing-library/react': '^13.0.0',
        });
    });
});

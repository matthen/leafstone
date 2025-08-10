/**
 * @fileoverview Parses JSX files to extract NPM dependencies from @requires comments.
 */

function extractDependencies(jsxContent) {
    const requiresRegex = /\/\/ @requires (.+)/g;
    const dependencies = {};
    let match;

    while ((match = requiresRegex.exec(jsxContent)) !== null) {
        const depString = match[1].trim();

        // Handle both "package@version" and "package" formats
        if (depString.includes('@')) {
            const lastAtIndex = depString.lastIndexOf('@');
            const pkg = depString.substring(0, lastAtIndex);
            const version = depString.substring(lastAtIndex + 1);
            dependencies[pkg] = version;
        } else {
            dependencies[depString] = 'latest';
        }
    }

    return dependencies;
}

module.exports = { extractDependencies };

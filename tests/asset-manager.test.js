/**
 * @fileoverview Tests for asset management functionality.
 */

const { extractAssets } = require("../lib/asset-manager");
const path = require("path");

describe("extractAssets", () => {
  const mockComponentFile = "/fake/path/MyComponent.jsx";

  test("should extract asset with original filename", () => {
    const jsxContent = `
// @requires-asset ./logo.svg
import React from 'react';

function MyComponent() {
  return <img src="/assets/logo.svg" alt="Logo" />;
}
`;

    const result = extractAssets(jsxContent, mockComponentFile);
    expect(result).toEqual([
      {
        sourcePath: path.resolve("/fake/path", "./logo.svg"),
        filename: "logo.svg",
        urlPath: "/assets/logo.svg",
      },
    ]);
  });

  test("should extract asset with custom filename", () => {
    const jsxContent = `
// @requires-asset ./logo.svg company-logo.svg
function MyComponent() {
  return <img src="/assets/company-logo.svg" alt="Logo" />;
}
`;

    const result = extractAssets(jsxContent, mockComponentFile);
    expect(result).toEqual([
      {
        sourcePath: path.resolve("/fake/path", "./logo.svg"),
        filename: "company-logo.svg",
        urlPath: "/assets/company-logo.svg",
      },
    ]);
  });

  test("should extract multiple assets with different filenames", () => {
    const jsxContent = `
// @requires-asset ./logo.svg
// @requires-asset ../images/hero.png hero-image.png
// @requires-asset ./data/config.json app-config.json
function MyComponent() {
  return <div>Multiple assets</div>;
}
`;

    const result = extractAssets(jsxContent, mockComponentFile);
    expect(result).toEqual([
      {
        sourcePath: path.resolve("/fake/path", "./logo.svg"),
        filename: "logo.svg",
        urlPath: "/assets/logo.svg",
      },
      {
        sourcePath: path.resolve("/fake/path", "../images/hero.png"),
        filename: "hero-image.png",
        urlPath: "/assets/hero-image.png",
      },
      {
        sourcePath: path.resolve("/fake/path", "./data/config.json"),
        filename: "app-config.json",
        urlPath: "/assets/app-config.json",
      },
    ]);
  });

  test("should return empty array when no assets found", () => {
    const jsxContent = `
import React from 'react';

function MyComponent() {
  return <div>No assets</div>;
}
`;

    const result = extractAssets(jsxContent, mockComponentFile);
    expect(result).toEqual([]);
  });

  test("should handle relative paths correctly", () => {
    const jsxContent = `
// @requires-asset ../shared/icon.svg
// @requires-asset ./local/file.png
// @requires-asset ../../global/asset.jpg
function MyComponent() {
  return <div>Relative paths</div>;
}
`;

    const result = extractAssets(jsxContent, mockComponentFile);
    expect(result).toEqual([
      {
        sourcePath: path.resolve("/fake/path", "../shared/icon.svg"),
        filename: "icon.svg",
        urlPath: "/assets/icon.svg",
      },
      {
        sourcePath: path.resolve("/fake/path", "./local/file.png"),
        filename: "file.png",
        urlPath: "/assets/file.png",
      },
      {
        sourcePath: path.resolve("/fake/path", "../../global/asset.jpg"),
        filename: "asset.jpg",
        urlPath: "/assets/asset.jpg",
      },
    ]);
  });

  test("should ignore non-asset comments", () => {
    const jsxContent = `
// This is a regular comment
// @requires lodash@4.17.21
// @requires-asset ./logo.svg
// Some other comment
/* @requires-asset ./ignored.png */
function MyComponent() {
  return <div>Only line comments work</div>;
}
`;

    const result = extractAssets(jsxContent, mockComponentFile);
    expect(result).toEqual([
      {
        sourcePath: path.resolve("/fake/path", "./logo.svg"),
        filename: "logo.svg",
        urlPath: "/assets/logo.svg",
      },
    ]);
  });

  test("should detect filename conflicts and exit", () => {
    const jsxContent = `
// @requires-asset ./logo.svg
// @requires-asset ../images/logo.svg
function MyComponent() {
  return <div>Conflicting filenames</div>;
}
`;

    // Mock process.exit to prevent actual exit during tests
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => {
      extractAssets(jsxContent, mockComponentFile);
    }).toThrow("process.exit called");

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Asset filename conflict: "logo.svg"'));

    mockExit.mockRestore();
    consoleSpy.mockRestore();
  });

  test("should handle different file extensions", () => {
    const jsxContent = `
// @requires-asset ./image.png custom-image.png
// @requires-asset ./data.json app-data.json
// @requires-asset ./font.woff2 custom-font.woff2
function MyComponent() {
  return <div>Different extensions</div>;
}
`;

    const result = extractAssets(jsxContent, mockComponentFile);
    expect(result).toEqual([
      {
        sourcePath: path.resolve("/fake/path", "./image.png"),
        filename: "custom-image.png",
        urlPath: "/assets/custom-image.png",
      },
      {
        sourcePath: path.resolve("/fake/path", "./data.json"),
        filename: "app-data.json",
        urlPath: "/assets/app-data.json",
      },
      {
        sourcePath: path.resolve("/fake/path", "./font.woff2"),
        filename: "custom-font.woff2",
        urlPath: "/assets/custom-font.woff2",
      },
    ]);
  });
});

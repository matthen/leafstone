/**
 * @fileoverview Manages static assets by parsing @requires-asset comments and copying files to temp directory.
 */

const path = require('path');
const fs = require('fs');

function extractAssets(jsxContent, componentFile) {
    const requiresAssetRegex = /^\/\/ @requires-asset (.+)$/gm;
    const assets = [];
    const usedFilenames = new Set();
    let match;

    while ((match = requiresAssetRegex.exec(jsxContent)) !== null) {
        const parts = match[1].trim().split(/\s+/);
        const assetPath = parts[0];
        const customFilename = parts[1]; // optional destination filename

        // Resolve relative paths relative to the component file
        const resolvedPath = path.resolve(path.dirname(componentFile), assetPath);
        const filename = customFilename || path.basename(assetPath);

        // Check for filename conflicts
        if (usedFilenames.has(filename)) {
            console.error(`❌ Asset filename conflict: "${filename}" is used by multiple assets`);
            console.error(
                `   Consider using custom filenames: // @requires-asset ${assetPath} ${filename.replace('.', '-2.')}`,
            );
            process.exit(1);
        }

        usedFilenames.add(filename);
        assets.push({
            sourcePath: resolvedPath,
            filename: filename,
            urlPath: `/assets/${filename}`,
        });
    }

    return assets;
}

async function copyAssets(assets, tempDir) {
    if (assets.length === 0) {
        return;
    }

    const assetsDir = path.join(tempDir, 'assets');
    fs.mkdirSync(assetsDir, { recursive: true, mode: 0o755 });

    console.log(`🎨 Copying assets: ${assets.map((a) => a.filename).join(', ')}`);

    for (const asset of assets) {
        try {
            if (!fs.existsSync(asset.sourcePath)) {
                console.error(`❌ Asset not found: ${asset.sourcePath}`);
                continue;
            }

            const destPath = path.join(assetsDir, asset.filename);
            fs.copyFileSync(asset.sourcePath, destPath);
            fs.chmodSync(destPath, 0o644);
            console.log(`✅ Copied ${asset.filename} to /assets/`);
        } catch (error) {
            console.error(`❌ Failed to copy ${asset.filename}: ${error.message}`);
        }
    }
}

module.exports = { extractAssets, copyAssets };

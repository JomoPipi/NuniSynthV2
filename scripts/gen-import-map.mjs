import { getImportMapFromNodeModules } from "@jsenv/node-module-import-map";
import path from "path";

/** @return {string} */
function dirname(/** @type {string} */ fileUrl) {
    return path.dirname(fileUrl.replace("file://", ""));
}

const projectRoot = path.resolve(dirname(import.meta.url), "..");

const importMap = await getImportMapFromNodeModules({
    projectDirectoryUrl: "file://" + projectRoot,
    projectPackageDevDependenciesIncluded: false,
});

console.log(JSON.stringify(importMap, null, 4));

#!/usr/bin/env node

import { exec as _exec } from "child_process";
import { promisify } from "util";

const exec = promisify(_exec);

await Promise.all([
    exec("npx tsc --watch"),
    exec("npx webpack --watch"),
    exec("npm start"),
]);

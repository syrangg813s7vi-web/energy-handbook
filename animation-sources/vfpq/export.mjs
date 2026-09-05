import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);
const require = createRequire(import.meta.url);
const { build } = require('esbuild');
const postcss = require('postcss');
const tailwind = require('@tailwindcss/postcss');
const js = await build({
  stdin: { contents: 'import React from "react"; import {createRoot} from "react-dom/client"; import App from "./app/page"; createRoot(document.getElementById("root")).render(React.createElement(App));', resolveDir: root, loader: 'tsx' },
  bundle: true, write: false, minify: true, format: 'iife', jsx: 'automatic',
  alias: { '@': root }, define: { 'process.env.NODE_ENV': '"production"' },
  legalComments: 'inline',
});
const css = await postcss([tailwind({ base: root })]).process(await readFile(path.join(root, 'app/globals.css'), 'utf8'), { from: path.join(root, 'app/globals.css') });
const output = path.resolve(root, '../../docs/public/demos/vfpq/index.html');
await mkdir(path.dirname(output), { recursive: true });
const html = '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>V/F/P/Q 场站闭环控制动画</title><style>' + css.css.replaceAll('</style', '<\\/style') + '</style></head><body><div id="root"></div><noscript>请启用 JavaScript 使用动画。V 通过 Q 调压，F 通过 ΔP 支撑频率，P/Q 分别跟踪功率目标。完整说明见所属文章。</noscript><script>' + js.outputFiles[0].text.replaceAll('</script', '<\\/script') + '</script></body></html>';
await writeFile(output, html);
console.log('Exported standalone V/F/P/Q animation, bytes:', Buffer.byteLength(html));

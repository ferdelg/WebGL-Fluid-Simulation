// Builds dist/index.html: one self-contained file for Flinsh (no external requests).
// Usage: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = (f) => readFileSync(new URL(f, import.meta.url));
const dataUri = (f, mime) => `data:${mime};base64,${read(f).toString('base64')}`;
const inlineScript = (code) => `<script>\n${code.replace(/<\/script/gi, '<\\/script')}\n</script>`;

function replaceOnce (html, from, to) {
    if (html.split(from).length !== 2) throw new Error(`expected exactly one match for: ${from}`);
    return html.replace(from, () => to);
}

let html = read('index.html').toString();
let script = read('script.js').toString();

script = replaceOnce(script, "createTextureAsync('LDR_LLL1_0.png')",
    `createTextureAsync('${dataUri('LDR_LLL1_0.png', 'image/png')}')`);

html = replaceOnce(html, '<script type="text/javascript" src="dat.gui.min.js"></script>',
    inlineScript(read('dat.gui.min.js').toString()));
html = replaceOnce(html, "url('iconfont.ttf')", `url('${dataUri('iconfont.ttf', 'font/ttf')}')`);
html = replaceOnce(html, '<link rel="icon" href="logo.png">',
    `<link rel="icon" href="${dataUri('logo.png', 'image/png')}">`);
html = replaceOnce(html, '<script src="./script.js"></script>', inlineScript(script));

mkdirSync(new URL('dist/', import.meta.url), { recursive: true });
writeFileSync(new URL('dist/index.html', import.meta.url), html);
console.log(`dist/index.html: ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);

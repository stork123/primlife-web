// Smoke test: guide markdown rendering against the real BIOT-GUIDE.md.
'use strict';
const fs = require('fs');
const path = require('path');

const { mdToHtml } = require('../src/guide.js');
const md = fs.readFileSync(path.join(__dirname, '..', 'docs', 'BIOT-GUIDE.md'), 'utf8');

let failures = 0;
function check(name, cond) {
  console.log((cond ? 'OK   ' : 'FAIL ') + name);
  if (!cond) failures++;
}

const html = mdToHtml(md);
check('renders title', html.includes('<h1>Reading the Biots: A Field Guide</h1>'));
check('renders headings', html.includes('<h2>Segment Colors</h2>') && html.includes('<h2>Life cycle</h2>'));
check('renders table', html.includes('<table>') && html.includes('<th>Color</th>'));
check('renders table rows', html.includes('<td>Leaf</td>'));
check('renders fenced code block', html.includes('<pre>') && html.includes('GREEN eats nothing'));
check('renders ordered list', html.includes('<ol>') && html.includes('<li><b>Born</b>'));
check('keeps wrapped list item in one li', html.includes('<b>Born</b> from a parent') && html.includes('watch for new shapes appearing.</li>'));
check('renders unordered list', html.includes('<ul>') && html.includes('regenerate'));
check('bold inline', html.includes('<b>biot</b>'));
check('escaped raw markdown bars', !html.includes('|-------|'));
check('no unrendered table separators', (html.match(/\|[-: ]+\|/g) || []).length === 0);
check('no unrendered headings', !/<[^>]*>#{2,} /.test(html));

console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL PASS');
process.exit(failures ? 1 : 0);

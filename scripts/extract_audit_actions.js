const fs = require('fs');
const path = require('path');

const inPathArg = process.argv[2];
const outPathArg = process.argv[3];

const inPath = inPathArg ? path.resolve(inPathArg) : path.resolve(__dirname, '..', 'docs', 'vyra_audit_report.html');
const outPath = outPathArg ? path.resolve(outPathArg) : path.resolve(__dirname, '..', 'docs', 'vyra_audit_actions.txt');

if (!fs.existsSync(inPath)) {
  console.error('Input file not found: ' + inPath);
  process.exit(2);
}

let s = fs.readFileSync(inPath, 'utf8');
// normalize
s = s.replace(/\r\n/g, '\n');

function findAllWithIndex(regex) {
  const r = [];
  let m;
  while ((m = regex.exec(s)) !== null) {
    let inner = m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    r.push({ text: inner, index: m.index });
  }
  return r;
}

const stepTitleRegex = /<div[^>]*class=["'][^"']*step-title[^"']*["'][^>]*>([\s\S]*?)<\/div>/g;
const cardBodyRegex = /<p[^>]*class=["'][^"']*card-body[^"']*["'][^>]*>([\s\S]*?)<\/p>/g;
const headerRegex = /<(?:h[1-4])[^>]*>([\s\S]*?)<\/(?:h[1-4])>/g;
const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/g;

const titles = findAllWithIndex(stepTitleRegex);
const bodies = findAllWithIndex(cardBodyRegex);
const headers = findAllWithIndex(headerRegex);
const listItems = findAllWithIndex(liRegex);

let out = `Acciones recomendadas — extraído de ${inPath}\n\n`;

if (titles.length > 0) {
  titles.forEach((t, i) => {
    out += `${i + 1}. ${t.text}\n`;
    const body = bodies.find(b => b.index > t.index);
    if (body) out += `   - Detalle: ${body.text}\n`;
    out += '\n';
  });
} else if (headers.length > 0) {
  headers.forEach((h, i) => {
    out += `${i + 1}. ${h.text}\n\n`;
  });
}

if (listItems.length > 0) {
  out += '\nListas / puntos detectados:\n';
  listItems.forEach(li => {
    out += `- ${li.text}\n`;
  });
}

if (titles.length === 0 && headers.length === 0 && listItems.length === 0) {
  const noTags = s.replace(/<[^>]+>/g, '\n').replace(/\n\s+\n/g, '\n').trim();
  out += '\nContenido plano:\n\n' + noTags.slice(0, 10000) + '\n\n[Contenido truncado]';
}

fs.writeFileSync(outPath, out, 'utf8');
console.log('WROTE ' + outPath);

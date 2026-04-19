const fs = require('fs');
const path = require('path');

const inPathArg = process.argv[2];
const outPathArg = process.argv[3];

const inPath = inPathArg
  ? path.resolve(inPathArg)
  : path.resolve(__dirname, '..', 'docs', 'vyra_audit_report.html');
const outPath = outPathArg
  ? path.resolve(outPathArg)
  : path.resolve(__dirname, '..', 'docs', 'vyra_audit_actions.txt');

if (!fs.existsSync(inPath)) {
  console.error('Input file not found: ' + inPath);
  process.exit(2);
}

let s = fs.readFileSync(inPath, 'utf8');
s = s.replace(/\r\n/g, '\n');

function findAllWithIndex(regex) {
  const results = [];
  let match;
  while ((match = regex.exec(s)) !== null) {
    const text = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    results.push({ text, index: match.index });
  }
  return results;
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
  titles.forEach((title, index) => {
    out += `${index + 1}. ${title.text}\n`;
    const body = bodies.find((candidate) => candidate.index > title.index);
    if (body) {
      out += `   - Detalle: ${body.text}\n`;
    }
    out += '\n';
  });
} else if (headers.length > 0) {
  headers.forEach((header, index) => {
    out += `${index + 1}. ${header.text}\n\n`;
  });
}

if (listItems.length > 0) {
  out += '\nListas / puntos detectados:\n';
  listItems.forEach((item) => {
    out += `- ${item.text}\n`;
  });
}

if (titles.length === 0 && headers.length === 0 && listItems.length === 0) {
  const noTags = s.replace(/<[^>]+>/g, '\n').replace(/\n\s+\n/g, '\n').trim();
  out += '\nContenido plano:\n\n' + noTags.slice(0, 10000) + '\n\n[Contenido truncado]';
}

fs.writeFileSync(outPath, out, 'utf8');
console.log('WROTE ' + outPath);

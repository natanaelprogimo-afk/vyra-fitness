import * as FileSystem from 'expo-file-system/legacy';

type WorkoutShareImageInput = {
  sessionName: string;
  title: string;
  subtitle: string;
  userName: string;
  dateLabel: string;
  durationMin: number;
  sets: number;
  volumeKg: number;
  prs: number;
  streak: number;
  muscleLabels: string[];
  comparisonText?: string | null;
  streakImpact?: string | null;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(value: string, maxChars: number, maxLines: number) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
    }
    current = word;
    if (lines.length >= maxLines) break;
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines.slice(0, maxLines);
}

function renderTextLines(lines: string[], x: number, y: number, lineHeight: number) {
  return lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join('');
}

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'workout';
}

export function buildWorkoutShareSvg(input: WorkoutShareImageInput) {
  const titleLines = wrapText(input.title, 18, 2);
  const subtitleLines = wrapText(input.subtitle, 36, 3);
  const comparisonLines = input.comparisonText ? wrapText(input.comparisonText, 32, 2) : [];
  const streakLines = input.streakImpact ? wrapText(input.streakImpact, 34, 2) : [];
  const chipLabels = input.muscleLabels.slice(0, 4);
  const metrics = [
    { label: 'Volumen', value: `${Math.round(input.volumeKg).toLocaleString('es-UY')} kg`, accent: '#FF5533' },
    { label: 'Duración', value: `${input.durationMin} min`, accent: '#F0F0F3' },
    { label: 'Series', value: String(input.sets), accent: '#F0F0F3' },
    { label: 'Racha', value: `${input.streak} días`, accent: '#F0F0F3' },
    { label: 'PRs', value: String(input.prs), accent: '#F0F0F3' },
  ];

  const metricCards = metrics.map((metric, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = 72 + col * 520;
    const y = 640 + row * 176;
    const width = index === metrics.length - 1 && metrics.length % 2 === 1 ? 520 : 440;

    return `
      <g>
        <rect x="${x}" y="${y}" width="${width}" height="136" rx="28" fill="#121219" stroke="rgba(255,255,255,0.06)" />
        <text x="${x + 28}" y="${y + 40}" fill="#9090A0" font-size="24" font-family="Arial, sans-serif" letter-spacing="1.5">${escapeXml(metric.label.toUpperCase())}</text>
        <text x="${x + 28}" y="${y + 96}" fill="${metric.accent}" font-size="48" font-weight="700" font-family="Arial, sans-serif">${escapeXml(metric.value)}</text>
      </g>
    `;
  }).join('');

  const chips = chipLabels.map((label, index) => {
    const x = 72 + (index % 2) * 300;
    const y = 1180 + Math.floor(index / 2) * 78;

    return `
      <g>
        <rect x="${x}" y="${y}" width="248" height="52" rx="26" fill="#171721" />
        <text x="${x + 24}" y="${y + 34}" fill="#F0F0F3" font-size="24" font-family="Arial, sans-serif">${escapeXml(label)}</text>
      </g>
    `;
  }).join('');

  return `
    <svg width="1200" height="1600" viewBox="0 0 1200 1600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="120" y1="80" x2="1080" y2="1520" gradientUnits="userSpaceOnUse">
          <stop stop-color="#09090B" />
          <stop offset="1" stop-color="#121219" />
        </linearGradient>
        <linearGradient id="accent" x1="160" y1="140" x2="1040" y2="960" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FF7A45" />
          <stop offset="1" stop-color="#FF5533" />
        </linearGradient>
      </defs>

      <rect width="1200" height="1600" fill="#050507" />
      <rect x="36" y="36" width="1128" height="1528" rx="48" fill="url(#bg)" stroke="rgba(255,255,255,0.08)" />
      <circle cx="992" cy="210" r="180" fill="url(#accent)" opacity="0.18" />
      <circle cx="170" cy="1360" r="220" fill="#06B6D4" opacity="0.08" />

      <text x="72" y="112" fill="#FF5533" font-size="24" font-weight="700" font-family="Arial, sans-serif" letter-spacing="7">VYRA</text>
      <text x="72" y="162" fill="#9090A0" font-size="24" font-family="Arial, sans-serif">${escapeXml(input.userName)}  |  ${escapeXml(input.dateLabel)}</text>

      <text x="72" y="260" fill="#F0F0F3" font-size="84" font-weight="800" font-family="Arial, sans-serif">
        ${renderTextLines(titleLines, 72, 260, 92)}
      </text>
      <text x="72" y="430" fill="#B2B2BE" font-size="34" font-family="Arial, sans-serif">
        ${renderTextLines(subtitleLines, 72, 430, 44)}
      </text>

      <rect x="72" y="520" width="360" height="72" rx="36" fill="rgba(255,85,51,0.16)" stroke="rgba(255,85,51,0.28)" />
      <text x="106" y="564" fill="#FF8F66" font-size="32" font-weight="700" font-family="Arial, sans-serif">${escapeXml(input.sessionName)}</text>

      ${comparisonLines.length ? `
        <text x="72" y="598" fill="#A6E38C" font-size="26" font-family="Arial, sans-serif">
          ${renderTextLines(comparisonLines, 72, 598, 34)}
        </text>
      ` : ''}

      ${metricCards}

      <text x="72" y="1120" fill="#9090A0" font-size="24" font-weight="700" font-family="Arial, sans-serif" letter-spacing="2">MÚSCULOS TRABAJADOS</text>
      ${chips || `
        <rect x="72" y="1180" width="300" height="52" rx="26" fill="#171721" />
        <text x="96" y="1214" fill="#F0F0F3" font-size="24" font-family="Arial, sans-serif">Sesión general</text>
      `}

      ${streakLines.length ? `
        <text x="72" y="1390" fill="#F0F0F3" font-size="32" font-family="Arial, sans-serif">
          ${renderTextLines(streakLines, 72, 1390, 40)}
        </text>
      ` : ''}

      <text x="72" y="1502" fill="#6F6F79" font-size="24" font-family="Arial, sans-serif">Compartido desde Vyra Fitness</text>
    </svg>
  `.trim();
}

export async function writeWorkoutShareSvgFile(svg: string, sessionName: string) {
  const base = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!base) {
    throw new Error('No encontramos un directorio local para generar la imagen.');
  }

  const dir = `${base}vyra-shares/`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch((e) => {
    console.debug?.('[workout-share-image] makeDirectoryAsync failed', e);
  });

  const filename = `vyra-${sanitizeFileName(sessionName)}-${Date.now()}.svg`;
  const uri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(uri, svg, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  return uri;
}

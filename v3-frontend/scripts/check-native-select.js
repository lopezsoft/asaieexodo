#!/usr/bin/env node
/**
 * Script de validacion estatica para prohibir el uso del elemento HTML nativo `<select>`
 * en plantillas HTML y templates inline de componentes Angular (.ts).
 * Regla obligatoria: Usar siempre `<app-v3-searchable-select>` (V3SearchableSelectComponent).
 */

const fs = require('node:fs');
const path = require('node:path');

const SRC_ROOT = path.resolve(__dirname, '..', 'src', 'app');
const NATIVE_SELECT_REGEX = /<select\b[^>]*>/gi;

function collectFiles(dirPath, accumulated = []) {
  if (!fs.existsSync(dirPath)) {
    return accumulated;
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, accumulated);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.html') ||
        (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')))
    ) {
      accumulated.push(fullPath);
    }
  }
  return accumulated;
}

function getLineNumber(content, offset) {
  return content.slice(0, offset).split(/\r?\n/).length;
}

function scanHtmlSegment(filePath, htmlContent, baseOffset, fullContent, violations) {
  NATIVE_SELECT_REGEX.lastIndex = 0;
  let match;
  while ((match = NATIVE_SELECT_REGEX.exec(htmlContent)) !== null) {
    const line = getLineNumber(fullContent, baseOffset + match.index);
    violations.push({
      file: path.relative(path.resolve(__dirname, '..'), filePath),
      line,
      snippet: match[0].replace(/\s+/g, ' ').trim().slice(0, 140),
    });
  }
}

function main() {
  const files = collectFiles(SRC_ROOT);
  const violations = [];
  let htmlCount = 0;
  let tsCount = 0;

  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (filePath.endsWith('.html')) {
      htmlCount++;
      scanHtmlSegment(filePath, content, 0, content, violations);
    } else {
      tsCount++;
      const inlineTemplateRegex = /template\s*:\s*`([\s\S]*?)`/g;
      let tplMatch;
      while ((tplMatch = inlineTemplateRegex.exec(content)) !== null) {
        const innerOffset =
          tplMatch.index + tplMatch[0].indexOf(tplMatch[1]);
        scanHtmlSegment(filePath, tplMatch[1], innerOffset, content, violations);
      }
    }
  }

  if (violations.length > 0) {
    process.stderr.write(
      `\n[ERROR] Se detectaron ${violations.length} usos prohibidos de '<select>' nativo. Usa <app-v3-searchable-select>:\n`,
    );
    for (const violation of violations) {
      process.stderr.write(
        `  - ${violation.file}:${violation.line} -> ${violation.snippet}\n`,
      );
    }
    process.exit(1);
  }

  process.stdout.write(
    `[OK] Validacion superada: 0 elementos nativos '<select>' en ${htmlCount} plantillas HTML y ${tsCount} archivos TS.\n`,
  );
}

main();

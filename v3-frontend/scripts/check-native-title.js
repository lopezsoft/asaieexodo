#!/usr/bin/env node
/**
 * Script de validacion estatica para prohibir el uso del atributo HTML nativo `title`
 * (`title="..."`, `[title]="..."`, `[attr.title]="..."`) en plantillas Angular.
 * Regla obligatoria: Usar siempre `[appCustomTooltip]` (CustomTooltipDirective).
 */

const fs = require('node:fs');
const path = require('node:path');

const SRC_ROOT = path.resolve(__dirname, '..', 'src');
const NATIVE_TITLE_REGEX = /\s(?:\[attr\.title\]|\[title\]|title)\s*=/g;

function collectHtmlFiles(dirPath, accumulated = []) {
  if (!fs.existsSync(dirPath)) {
    return accumulated;
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      collectHtmlFiles(fullPath, accumulated);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      accumulated.push(fullPath);
    }
  }
  return accumulated;
}

function main() {
  const htmlFiles = collectHtmlFiles(SRC_ROOT);
  const violations = [];

  for (const filePath of htmlFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((lineText, index) => {
      // Ignorar <title> del index.html o iframe title requerido por accesibilidad si aplica
      if (NATIVE_TITLE_REGEX.test(lineText) && !/<iframe\b/i.test(lineText)) {
        violations.push({
          file: path.relative(path.resolve(__dirname, '..'), filePath),
          line: index + 1,
          snippet: lineText.trim(),
        });
      }
      NATIVE_TITLE_REGEX.lastIndex = 0;
    });
  }

  if (violations.length > 0) {
    process.stderr.write(
      `\n[ERROR] Se detectaron ${violations.length} usos prohibidos del atributo nativo 'title'. Usa [appCustomTooltip]:\n`,
    );
    for (const violation of violations) {
      process.stderr.write(
        `  - ${violation.file}:${violation.line} -> ${violation.snippet}\n`,
      );
    }
    process.exit(1);
  }

  process.stdout.write(
    `[OK] Validacion superada: 0 atributos nativos 'title' en ${htmlFiles.length} plantillas HTML.\n`,
  );
}

main();

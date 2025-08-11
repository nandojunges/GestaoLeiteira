#!/usr/bin/env bash
set -e
echo "→ npm cache clean --force"
npm cache clean --force

echo "→ removendo package-lock"
rm -f package-lock.json

echo "→ install (registry padrão)"
if npm i; then
  echo "✓ install OK (registry padrão)"
else
  echo "⚠️  falha 1 — tentando mirror npmmirror com escopo @fullcalendar"
  if npm i --registry=https://registry.npmmirror.com --@fullcalendar:registry=https://registry.npmmirror.com; then
    echo "✓ install OK (mirror npmmirror)"
  else
    echo "⚠️  falha 2 — tentando com legacy-peer-deps"
    npm i --legacy-peer-deps \
      --registry=https://registry.npmmirror.com \
      --@fullcalendar:registry=https://registry.npmmirror.com || {
      echo "❌ install falhou mesmo com mirror e legacy-peer-deps"; exit 1;
    }
    echo "✓ install OK (legacy-peer-deps + mirror)"
  fi
fi

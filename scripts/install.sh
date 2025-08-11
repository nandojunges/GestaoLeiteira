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
  echo "⚠️  falha 1 — tentando mirror npmmirror"
  npm i --registry=https://registry.npmmirror.com || {
    echo "❌ install falhou mesmo com mirror"; exit 1;
  }
  echo "✓ install OK (mirror npmmirror)"
fi

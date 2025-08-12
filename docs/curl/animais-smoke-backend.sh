#!/usr/bin/env bash
BASE=${BASE:-http://localhost:3001}
set -e
echo "Criar animal:"; curl -s -X POST $BASE/api/v1/animais -H 'content-type: application/json' -d '{"numero":"A100","brinco":"A100","nascimento":"2024-01-10"}'; echo
echo "Listar vazias:"; curl -s "$BASE/api/v1/animais?estado=vazia"; echo

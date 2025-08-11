#!/usr/bin/env bash
BASE=${BASE:-http://localhost:3000}
ID=$1
[ -z "$ID" ] && echo "Uso: $0 <idAnimal>" && exit 1
set -e
echo "IA:" && curl -s -X POST $BASE/api/v1/reproducao/$ID/inseminacoes -H 'content-type: application/json' -d '{"data":"2025-07-01"}' && echo
echo "Diagnóstico +:" && curl -s -X POST $BASE/api/v1/reproducao/$ID/diagnosticos -H 'content-type: application/json' -d '{"data":"2025-08-01","resultado":"positivo"}' && echo
echo "Gestantes:" && curl -s "$BASE/api/v1/animais?estado=gestante" && echo

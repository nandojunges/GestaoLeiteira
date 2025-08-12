#!/usr/bin/env bash
BASE=${BASE:-http://localhost:3001}
set -e
echo "Register:"; curl -s -X POST $BASE/api/v1/auth/register -H 'content-type: application/json' -d '{"email":"dev+teste@example.com","password":"123456"}'; echo
echo "Send code:"; curl -s -X POST $BASE/api/v1/auth/send-code -H 'content-type: application/json' -d '{"email":"dev+teste@example.com"}'; echo

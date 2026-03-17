#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  echo ""
  echo "In Railway: Add a PostgreSQL database, then in your API service:"
  echo "  Variables → + New Variable → Add Reference → [Select Postgres] → DATABASE_URL"
  echo ""
  echo "Or set DATABASE_URL manually to your Postgres connection string."
  exit 1
fi

cd /app && npx prisma migrate deploy
cd /app/server && exec node dist/index.js

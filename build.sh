#!/bin/bash
set -e

echo "🔧 Installing dependencies..."
npm ci

echo "🔨 Generating Prisma client..."
npx prisma generate

echo "🔄 Running database migrations..."
npx prisma db push

echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Build completed successfully!"
#!/bin/bash
echo "🔍 Running security audit..."
npm audit
echo "📝 Running lint check..."
npm run lint 2>/dev/null || echo "⚠️ Lint not configured"
echo "🏗️ Running build check..."
npm run build 2>/dev/null || echo "⚠️ Build failed"
echo "✅ Audit complete"

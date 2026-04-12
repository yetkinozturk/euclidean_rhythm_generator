#!/bin/bash
# Deploy to GitHub Pages via gh-pages branch
set -e

# Build
bun run build

# Push dist to gh-pages branch
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy"
git push -f git@github.com:yetkinozturk/euclidean_rhythm_generator.git gh-pages

cd ..
echo "Deployed to https://yetkinozturk.github.io/euclidean_rhythm_generator/"

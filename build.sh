#!/bin/bash
set -e

echo "Installing server dependencies..."
cd server && npm install
cd ..

echo "Installing frontend dependencies..."
cd keffi-apartment-suites && npm install
cd ..

echo "Building frontend..."
cd keffi-apartment-suites && npm run build
cd ..

echo "Build completed successfully!"

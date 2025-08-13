#!/bin/bash

set -e

cd "$(dirname "$0")/.."

# Check if esbuild is installed
if ! command -v esbuild &> /dev/null; then
    echo "Error: esbuild is not installed. Please install it first:"
    echo "https://esbuild.github.io/getting-started/#install-esbuild"
    exit 1
fi

# Initialize submodules if not already done
echo "Updating submodules..."
git submodule update --init --recursive

# Install npm dependencies
echo "Installing dependencies..."
cd src/js
yarn

# Go back to root and start development server
cd ../..
echo "Starting development server..."
go run main.go
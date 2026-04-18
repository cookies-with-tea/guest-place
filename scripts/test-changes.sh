#!/bin/bash

# Find changed rust files in the current git diff
CHANGED_FILES=$(git diff --name-only HEAD | grep '\.rs$')

if [ -z "$CHANGED_FILES" ]; then
    echo "No changed Rust files found."
    exit 0
fi

echo "Detected changes in:"
echo "$CHANGED_FILES"

# For each changed file, try to run related tests
# This is a simple implementation. A better one would use cargo-nextest or parse imports.
for FILE in $CHANGED_FILES; do
    # Extract module name from file path
    MOD_NAME=$(basename "$FILE" .rs)
    if [ "$MOD_NAME" == "main" ] || [ "$MOD_NAME" == "lib" ]; then
        echo "Running all tests as $MOD_NAME changed..."
        cargo test
        break
    else
        echo "Running tests for module $MOD_NAME..."
        cargo test -- "$MOD_NAME"
    fi
done

#!/bin/bash

# Check if commit message was provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <commit message>"
    echo "Example: $0 \"Fix login bug and update documentation\""
    exit 1
fi

# Format, generate docs, add, commit, and push
prettier --write src/
npx typedoc src/*
git add -A
git commit -m "$*"
git push
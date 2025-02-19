#!/bin/bash

# Check if a file is provided as argument
if [ $# -ne 1 ]; then
    echo "Usage: $0 <html-file>"
    exit 1
fi

# Check if file exists
if [ ! -f "$1" ]; then
    echo "Error: File '$1' not found"
    exit 1
fi

# Extract all id attributes and their values, then find duplicates
echo "Checking for duplicate IDs in $1..."
grep -oP 'id=["'"'"']\K[^"'"'"']+' "$1" | sort | uniq -d | while read -r duplicate_id; do
    echo "Duplicate ID found: '$duplicate_id'"
    echo "Locations:"
    grep -n "id=[\"']$duplicate_id[\"']" "$1"
    echo "---"
done

# Check if any duplicates were found
if [ "$(grep -oP 'id=["'"'"']\K[^"'"'"']+' "$1" | sort | uniq -d | wc -l)" -eq 0 ]; then
    echo "No duplicate IDs found."
fi
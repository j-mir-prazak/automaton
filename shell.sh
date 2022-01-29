#!/bin/bash

if [[ -z $1 ]]; then
    exit 1
fi

FILE="$1"

cat "$FILE" && exit 0
exit 1

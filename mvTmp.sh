#!/bin/bash

if [[ -z $1 ]]; then
    exit 1
fi

if [[ -z $2 ]]; then
    exit 1
fi

SRC="$1"
DST="$2"

#mv "$1" "$2" && exit 0
## testing 
cp "$1" "$2" && exit 0

#!/bin/bash

if [[ -z $1 ]]; then
    exit 1
fi

if [[ -z $2 ]]; then
    exit 1
fi

SRC="$1"
DST="$2"

[[ ! -d "$DST" ]] && mkdir -p "$DST"
[[ ! -d "$DST" ]] && exit 1
#mv "$1" "$2" && exit 0
## testing 
mv "$1" "$2" && exit 0
exit 1

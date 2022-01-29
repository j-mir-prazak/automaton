#!/bin/bash

if [[ -z $1 ]]; then
    exit 1
fi

DST="$1"

rm "$DST" -rf && exit 0
exit 1

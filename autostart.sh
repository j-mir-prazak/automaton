#!/bin/bash

cd $(dirname (realpath $0))

SRC="/home/pi/m70/png/"
DST="/tmp/slides/"

[[ ! -d "$SRC" ]] && mkdir -p "$SRC"
[[ ! -d "$DST" ]] && mkdir -p "$DST"

while true; do
    echo "LOOP"
    node index.js "$SRC" "$DST"
    sleep 1

done

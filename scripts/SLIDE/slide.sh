#!/bin/bash

SCRIPTPATH=$(dirname $(realpath $0))
#echo $SCRIPTPATH

if [[ -z $1 ]]; then
    exit 1
fi

FILE="$(realpath $1)"
NAME=$(echo "$(basename $FILE)" | perl -pE 's/(.*)\..*/$1/g')
TMP=/tmp/
TMPFILE="$TMP/$NAME".mkv
DST=/tmp/slides/


[[ ! -d $DST ]] && mkdir -p "$DST"
#echo "$FILE"
#echo "$NAME"

ffmpeg -y -i $SCRIPTPATH/blank.mkv -i "$FILE" -filter_complex "[0:0]setpts=PTS-STARTPTS[blank],[1:0]setpts=PTS-STARTPTS[top],[top][blank]overlay[overlay]" -map "[overlay]" -c:v libx264 -crf 20 -preset medium -pix_fmt yuv420p -f matroska "$TMPFILE"

if [[ $? == 0 ]]; then
    mv "$TMPFILE" "$DST"
    exit 0
else
    rm "$TMPFILE"
    exit 1
fi

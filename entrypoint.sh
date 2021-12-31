#!/bin/sh
set -e

if [ "$1" = 'bambou' ]; then
    python -u /bambou/bambou.py
    exit
fi

exec "$@"
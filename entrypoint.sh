#!/bin/sh
set -e

if [ "$1" = 'flow' ]; then
    python -u /flow/flow.py
    exit
fi

exec "$@"
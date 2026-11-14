#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
mkdir -p build
javac --add-modules jdk.httpserver -encoding UTF-8 -d build src/ScamSathiServer.java
exec java --add-modules jdk.httpserver -cp build ScamSathiServer "${PORT:-18878}"

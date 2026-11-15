#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
mkdir -p build
javac --add-modules jdk.httpserver -encoding UTF-8 -d build src/ScamSathiServer.java
echo "Starting ScamSathi with integrated AI Agent at http://127.0.0.1:${PORT:-18878}"
echo "Set GEMINI_API_KEY environment variable to enable AI features"
exec java --add-modules jdk.httpserver -cp build ScamSathiServer "${PORT:-18878}"

# Setup

## Requirements

- Java 17 or newer with `java` and `javac` on `PATH` for local service mode.
- Node.js 20+ and npm for automated tests.
- A current browser. Camera access requires HTTPS or localhost and is requested only after **Start scanning** is pressed.

## Windows

1. Open the repository directory.
2. Double-click `run.bat` or run it from a terminal.
3. Visit `http://127.0.0.1:18878`.
4. Close the server window to stop the service.

## macOS / Linux

```sh
chmod +x run.sh
./run.sh
```

Visit `http://127.0.0.1:18878`. To change ports, for example:

```sh
PORT=19000 ./run.sh
```

The service binds only to `127.0.0.1`. Do not change it to a public interface without adding and reviewing production controls.

## Static hosting

The GitHub Actions workflow in `.github/workflows/pages.yml` deploys `web/` when the configured branch is pushed. Enable GitHub Pages with **GitHub Actions** as the build source in repository settings if Pages is not already enabled. The expected address is `https://ada203880-boop.github.io/scamsathi-vibex26/`; confirm a successful workflow before sharing it as live.

## Tests

```sh
npm test
```

This compiles the Java service into the ignored `build/` folder and runs rule and API smoke checks.

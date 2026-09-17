# _davIMAGE build notes

## Requirements

- Node.js LTS
- Rust 1.85 or newer
- Tauri 2 platform prerequisites

## Windows

Run `RUN-WINDOWS.bat` for development or `BUILD-WINDOWS.bat` for a bundle.

## macOS

Run `./RUN-MACOS.sh` for development or `./BUILD-MACOS.sh` for a bundle.

## Linux

On Ubuntu/Debian first run `./INSTALL-LINUX-DEPS-UBUNTU.sh`, then `./RUN-LINUX.sh` or `./BUILD-LINUX.sh`.

## Current limitations

Animated GIF processing is intentionally unavailable to avoid frame loss. HEIC/HEIF files are detected, but full codec support is not bundled in this release. Metadata inspection is currently read-only.

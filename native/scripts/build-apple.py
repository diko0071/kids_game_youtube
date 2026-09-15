#!/usr/bin/env python3
"""Build the small WebKit prototype serially, without launching Xcode or a simulator."""
import argparse
import os
from pathlib import Path
import plistlib
import shutil
import signal
import subprocess
import time

ROOT = Path(__file__).resolve().parents[2]
NATIVE = ROOT / "native"


def guarded(command):
    # Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: bound only our compiler process group after prior Mac memory-pressure incidents.
    process = subprocess.Popen(command, cwd=ROOT, start_new_session=True)
    start = time.monotonic()
    while process.poll() is None:
        rows = subprocess.check_output(["ps", "-axo", "pgid=,rss="], text=True)
        rss_kb = sum(int(row.split()[1]) for row in rows.splitlines() if row.split()[0] == str(process.pid))
        pressure = subprocess.run(["sysctl", "-n", "kern.memorystatus_vm_pressure_level"], capture_output=True, text=True).stdout.strip()
        if time.monotonic() - start > 120 or rss_kb > 3 * 1024 * 1024 or pressure == "4":
            os.killpg(process.pid, signal.SIGTERM)
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                os.killpg(process.pid, signal.SIGKILL)
                process.wait()
            raise RuntimeError("Stopped owned build: time, memory, or system-pressure limit")
        time.sleep(0.5)
    if process.returncode:
        raise subprocess.CalledProcessError(process.returncode, command)


def build(platform, preview_url=None):
    sdk_name = "macosx" if platform == "mac" else "iphoneos"
    sdk = subprocess.check_output(["xcrun", "--sdk", sdk_name, "--show-sdk-path"], text=True).strip()
    target = "arm64-apple-macos14.0" if platform == "mac" else "arm64-apple-ios17.0"
    app = ROOT / "build" / "native" / platform / "MiraAndLuke.app"
    content = app / "Contents" if platform == "mac" else app
    resources = content / "Resources" if platform == "mac" else app
    binary_dir = content / "MacOS" if platform == "mac" else app
    resources.mkdir(parents=True, exist_ok=True)
    binary_dir.mkdir(parents=True, exist_ok=True)
    cache = ROOT / "build" / "native" / "module-cache"
    cache.mkdir(parents=True, exist_ok=True)
    guarded(["xcrun", "--sdk", sdk_name, "swiftc", "-parse-as-library", "-DDEBUG", "-num-threads", "1", "-sdk", sdk,
             "-target", target, "-module-cache-path", str(cache),
             *map(str, sorted((NATIVE / "apple").glob("*.swift"))), "-o", str(binary_dir / "MiraAndLuke")])
    for filename in ["player-policy.js", "approved-catalog.json"]:
        shutil.copyfile(NATIVE / "shared" / filename, resources / filename)
    info = {
        "CFBundleIdentifier": "ai.dkravt.kidstube.prototype",
        "CFBundleName": "MiraAndLuke", "CFBundleDisplayName": "Мира и Люк",
        "CFBundleExecutable": "MiraAndLuke", "CFBundlePackageType": "APPL",
        "CFBundleVersion": "1", "CFBundleShortVersionString": "0.1.0",
    }
    if platform == "mac":
        info.update({"LSMinimumSystemVersion": "14.0", "NSHighResolutionCapable": True})
        if preview_url:
            from urllib.parse import urlparse
            url = urlparse(preview_url)
            if url.scheme != "http" or url.hostname != "127.0.0.1" or url.username or url.password:
                raise ValueError("The debug preview must use HTTP on 127.0.0.1")
            info.update({"KidsPreviewURL": preview_url, "NSAppTransportSecurity": {"NSAllowsLocalNetworking": True}})
    else:
        info.update({"MinimumOSVersion": "17.0", "LSRequiresIPhoneOS": True, "UIDeviceFamily": [1, 2],
                     "UILaunchScreen": {}, "UISupportedInterfaceOrientations": [
                         "UIInterfaceOrientationPortrait", "UIInterfaceOrientationPortraitUpsideDown", "UIInterfaceOrientationLandscapeLeft", "UIInterfaceOrientationLandscapeRight"]})
    with (content / "Info.plist").open("wb") as file:
        plistlib.dump(info, file)
    if platform == "mac":
        subprocess.run(["codesign", "--force", "--sign", "-", str(app)], check=True)
    print(f"Built {app}" + (" (unsigned; requires development signing for installation)" if platform == "ios" else ""), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("platform", choices=["mac", "ios"])
    parser.add_argument("--preview-url", help="Mac Debug only: a 127.0.0.1 preview server")
    args = parser.parse_args()
    subprocess.run(["node", "native/scripts/export-catalog.mjs", "--check"], cwd=ROOT, check=True)
    if args.preview_url and args.platform != "mac":
        parser.error("--preview-url is only available for the Mac Debug build")
    build(args.platform, args.preview_url)

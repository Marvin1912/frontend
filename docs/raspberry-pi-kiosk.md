# Raspberry Pi kiosk setup

Run the `/touch` dashboard fullscreen on a Raspberry Pi driving the official 7" Touch Display v2 (1280 × 720).

This document targets **Raspberry Pi OS Bookworm (64-bit)** on a Pi 4 / Pi 5. Adjust paths for older releases that still use `/home/pi`.

## Prerequisites

- Pi flashed with Raspberry Pi OS and reachable over the network.
- The frontend either deployed somewhere reachable or built and served locally (`http://<frontend-host>:4200` in dev, behind nginx in production).
- The backend reachable from the Pi at the URL baked into `environment.apiUrl` at build time.

## Display orientation

The Touch Display v2 reports as `DSI-1`. Add to `/boot/firmware/config.txt` to flip the screen when mounted upside-down (default ribbon orientation is bottom):

```ini
# /boot/firmware/config.txt
dtoverlay=vc4-kms-v3d
display_lcd_rotate=2     # 2 = 180°, 1 = 90° CW, 3 = 90° CCW
```

Touch coordinates follow the rotation automatically in Bookworm — no separate `libinput` calibration needed.

## Disable screen blanking and hide the cursor

```bash
sudo apt install -y unclutter
```

Create `~/.config/wayfire.ini` (Wayland, default on Bookworm):

```ini
[idle]
dpms_timeout = 0
screensaver_timeout = 0
```

Or, if running X11 (legacy), put this in `~/.xsessionrc`:

```bash
xset s off
xset -dpms
xset s noblank
unclutter -idle 0 &
```

## Chromium kiosk launch

```bash
chromium-browser --kiosk --noerrdialogs --disable-translate \
  --disable-features=TranslateUI --check-for-update-interval=31536000 \
  --disable-pinch --overscroll-history-navigation=0 \
  --autoplay-policy=no-user-gesture-required \
  --app=http://<frontend-host>:4200/touch
```

Flag rationale:

| Flag | Why |
|---|---|
| `--kiosk` | Fullscreen, no chrome. |
| `--noerrdialogs` | Suppress "did you mean to close?" popups. |
| `--disable-translate` / `--disable-features=TranslateUI` | Stop the translate bar from hijacking the layout. |
| `--check-for-update-interval=31536000` | Don't pester for updates once a year. |
| `--disable-pinch` | Touch gestures should not zoom the dashboard. |
| `--overscroll-history-navigation=0` | Swiping in from the edge must not navigate away. |
| `--app=<url>` | Renders without the address bar even outside `--kiosk`, useful for debugging. |

## Autostart via systemd user unit

Recommended over `~/.config/autostart/*.desktop` because systemd will restart Chromium if it crashes.

```bash
mkdir -p ~/.config/systemd/user
cat > ~/.config/systemd/user/touch-kiosk.service <<'EOF'
[Unit]
Description=Touch dashboard kiosk
After=graphical-session.target
PartOf=graphical-session.target

[Service]
Type=simple
ExecStart=/usr/bin/chromium-browser --kiosk --noerrdialogs --disable-translate \
  --disable-features=TranslateUI --check-for-update-interval=31536000 \
  --disable-pinch --overscroll-history-navigation=0 \
  --app=http://<frontend-host>:4200/touch
Restart=on-failure
RestartSec=5

[Install]
WantedBy=graphical-session.target
EOF

systemctl --user daemon-reload
systemctl --user enable --now touch-kiosk.service
sudo loginctl enable-linger "$USER"   # so the user unit starts at boot
```

Logs: `journalctl --user -u touch-kiosk -f`.

## Networking

The dashboard polls `/climate/readings` every 60 s and `/plants` on load. The Pi must reach the backend host reliably:

- **Static lease** for the Pi on the router DHCP table, *or*
- **mDNS** (`raspberrypi.local`) for the Pi side, and bake the backend hostname into `environment.apiUrl` at build time (`scripts/generate-env.js`).
- If the backend lives behind a TLS reverse proxy, prefer the public hostname — Chromium does not love mixed-content kiosks.

## Verifying

After reboot:

1. The Pi should land directly in the dashboard within ~15 s of the desktop appearing.
2. `systemctl --user status touch-kiosk` is `active (running)`.
3. The cursor disappears after one second of inactivity.
4. Temperature cards refresh visibly every 60 s (watch the freshness dot).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Black screen, cursor visible | Chromium failed to start — check `journalctl --user -u touch-kiosk`. |
| Layout compressed | Display reporting wrong resolution — confirm `1280x720` in `wlr-randr` output. |
| Touch off by 180° | `display_lcd_rotate` set without rebooting; touch driver picks up rotation only at boot. |
| Cards stuck on "loading" | Backend unreachable — `curl http://<backend>:9001/climate/readings` from the Pi. |

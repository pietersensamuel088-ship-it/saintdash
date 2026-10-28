# Design System: SaintDash Telemetry

## Aesthetic Direction: High-Precision Dark Telemetry
Inspired by Grafana, Datadog, and Proxmox VE dark interfaces. Dark canvas (`#090a0f`), subtle borders (`#1e2230`), clean typography, and glowing semi-circular radial arc gauges.

## Color Palette
- **Canvas Base**: `#090a0f`
- **Surface Elevation**: `#11141f`
- **Surface Hover**: `#161a28`
- **Border / Divider**: `#1e2230`
- **Foreground Primary**: `#f8fafc`
- **Foreground Muted**: `#94a3b8`
- **Accent Emerald (Healthy / Idle / Low CPU)**: `#10b981` (gauge arc: `#22c55e`)
- **Accent Amber (Warning / Medium Load)**: `#f59e0b`
- **Accent Rose (Critical / High RAM / High Temp)**: `#ef4444`
- **Accent Cyan (Docker / Telemetry Network)**: `#06b6d4`
- **Accent Violet (Databases / Storage)**: `#8b5cf6`

## Typography
- Font Family: `Inter`, system UI font fallback.
- Data / Numerals: Tabular numbers (`font-variant-numeric: tabular-nums`) with `font-mono` for IPs, IDs, and precise byte counts.
- Hierarchy: Clean uppercase section markers with subtle tracking (`tracking-wider text-xs font-semibold text-slate-400`).

## Component Guidelines
1. **Gauges**: Thick semi-circular SVG arc meters with curved caps, dark background track, dynamic color based on usage percent, and bold centered numeric value.
2. **Telemetry Cards**: Understated bordered panels with subtle inset shadow, clear metric labels, and primary/total value pairs (e.g. `10.4 GiB / 15.4 GiB`).
3. **Data Tables**: Striped compact table rows with status badges (pulsing green dot for running), direct CPU/RAM percentage bars, and quick action filters.
4. **Time Series Charts**: Dark canvas with faint grid lines (`#1e2230`), smooth stroke curves, custom dark tooltips, and distinct line colors matching the Grafana reference.

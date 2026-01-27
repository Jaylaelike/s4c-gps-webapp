# Cache Optimization for S4C Trajectory Monitoring

## Overview
Comprehensive cache management system to ensure fresh data on every reload and automatic updates.

## Implemented Features

### 1. HTTP Server Configuration
- **Cache-Control**: Set to `-1` (no caching) in http-server
- **CORS Enabled**: Allows cross-origin requests
- **Custom Start Script**: Ensures proper server configuration

### 2. HTML Meta Tags
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta http-equiv="Pragma" content="no-cache">
<meta http-equiv="Expires" content="0">
```

### 3. JavaScript Fetch Headers
Every CSV file request includes:
- `Cache-Control: no-cache, no-store, must-revalidate`
- `Pragma: no-cache`
- `Expires: 0`
- `cache: 'no-store'` option

### 4. Cache-Busting Parameters
- Timestamp: `?t=${Date.now()}`
- Random string: `&r=${Math.random().toString(36).substring(7)}`

### 5. Service Worker & Cache API Cleanup
- Automatically unregisters any service workers on load
- Clears all browser caches on application start

### 6. Auto-Refresh System
- **Interval**: 30 seconds
- **Visual Countdown**: Shows "Next refresh: Xs"
- **Loading Indicator**: Shows "🔄 Refreshing data..." during refresh
- **Success Feedback**: Shows "✓ Data updated!" on completion
- **Error Handling**: Shows "⚠ Refresh failed" on errors

### 7. Manual Refresh Options
- **Button**: Click "🔄 Refresh" button in Station Filter panel
- **Keyboard Shortcut**: Press `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac)
- **Visual Feedback**: Button shows "⏳ Loading..." during refresh

### 8. State Preservation
During refresh, the system maintains:
- Current station selection
- Animation play/pause state
- Current time position in the timeline

## How to Use

### Automatic Updates
The application automatically checks for new data every 30 seconds. No action required.

### Manual Refresh
1. Click the "🔄 Refresh" button in the Satellite Monitor panel
2. Or press `Ctrl+R` / `Cmd+R` on your keyboard

### Update CSV Files
1. Update any `*_S4C_last15min.csv` file on your host machine
2. Changes are immediately available in the container (via Docker volumes)
3. The web app will pick up changes within 30 seconds (or immediately with manual refresh)

## Docker Configuration

### Volumes (Read-Only)
All CSV files are mounted as read-only volumes:
```yaml
volumes:
  - ./CHAN_S4C_last15min.csv:/app/CHAN_S4C_last15min.csv:ro
  - ./CHMA_S4C_last15min.csv:/app/CHMA_S4C_last15min.csv:ro
  # ... etc
```

### Server Settings
- Port: 3000
- Cache: Disabled (-c-1)
- CORS: Enabled
- Restart: Always

## Rebuild Instructions

To apply these changes:

```bash
# Stop the container
docker-compose down

# Rebuild with no cache
docker-compose build --no-cache

# Start the container
docker-compose up -d

# Or do it all in one command
docker-compose up --build -d
```

## Testing Cache Behavior

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Check CSV file requests - should see:
   - Status: 200 (not 304 Not Modified)
   - Size: Actual file size (not "from cache")
   - Headers: Cache-Control: no-cache

## Troubleshooting

### Data Not Updating
1. Check browser console for errors
2. Verify CSV files are being updated on host
3. Check Docker logs: `docker-compose logs -f`
4. Force refresh with Ctrl+R

### Browser Still Caching
1. Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache manually
3. Open in incognito/private window
4. Check if service workers are disabled in DevTools

## Performance Notes

- Auto-refresh pauses animation briefly during data load
- Minimal performance impact (only CSV files are reloaded)
- Static assets (HTML, CSS, JS) can still be cached
- Network requests are optimized with parallel loading

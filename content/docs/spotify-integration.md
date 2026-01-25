---
title: Spotify Integration
description: Display your currently playing music on your bio page.
category: Integrations
icon: Music
order: 6
---

# Spotify Integration

Show your visitors what you're listening to in real-time.

## Overview

The Spotify integration displays a "Now Playing" widget on your bio page with:

- Album artwork with blur background
- Song title and artist name
- Live progress bar
- Direct link to the track on Spotify
- "Not listening" state when offline

## Setup

### Step 1: Connect Your Account

1. Go to **Dashboard → Settings**
2. Find the **Spotify** section
3. Click **Connect Spotify**
4. Authorize Eziox to access your listening activity

### Step 2: Configure Privacy

After connecting, you can control visibility:

- **Show on Profile** - Toggle to show/hide the widget
- **Show When Offline** - Display "Not listening" or hide completely

## How It Works

### Real-Time Updates

The widget refreshes every 10 seconds to show your current track.

### Token Management

- We securely store your Spotify tokens (encrypted with AES-256-GCM)
- Tokens auto-refresh when expired
- You can disconnect anytime

### Privacy

- We only access your "currently playing" data
- We don't access your playlists, saved tracks, or listening history
- Your Spotify data is never shared with third parties

## Widget Appearance

The Now Playing widget adapts to your theme:

### Playing State

```
┌─────────────────────────────────┐
│  🎵  Song Title                 │
│      Artist Name                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  1:23 ─────────────────── 3:45  │
└─────────────────────────────────┘
```

### Not Listening State

```
┌─────────────────────────────────┐
│  🎵  Not listening to Spotify   │
│      Check back later           │
└─────────────────────────────────┘
```

## Troubleshooting

### Widget Not Showing

1. Check that Spotify is connected in Settings
2. Ensure "Show on Profile" is enabled
3. Make sure you're actively playing music (not paused)

### Wrong Track Showing

- The widget updates every 10 seconds
- Try refreshing the page
- Check if you're playing on the correct device

### Connection Issues

1. Disconnect Spotify in Settings
2. Clear your browser cache
3. Reconnect your account

## Disconnect

To remove the Spotify integration:

1. Go to **Dashboard → Settings**
2. Click **Disconnect** in the Spotify section
3. Your tokens are immediately deleted

You can also revoke access from [Spotify Account Settings](https://www.spotify.com/account/apps/).

## Supported Platforms

The integration works with:

- Spotify Desktop App
- Spotify Web Player
- Spotify Mobile App
- Spotify on smart speakers (limited)

## Future Features

Coming soon:

- Recently played tracks
- Top artists/tracks display
- Playlist embeds
- Apple Music integration

---

Need help? Contact us at [support@eziox.link](mailto:support@eziox.link).

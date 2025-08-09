# Genius API Setup Guide

To enhance your song search with the Genius API, follow these steps:

## 1. Get Your Genius API Access Token

1. Go to [Genius API Clients page](https://genius.com/api-clients)
2. Sign up or log in to your Genius account
3. Click "New API Client"
4. Fill in your app details:
   - **App Name**: Lyric Playground
   - **App Website URL**: http://localhost:5175 (or your domain)
   - **Redirect URI**: http://localhost:5175 (can be anything for client-only apps)
5. Click "Save"
6. Click "Generate Access Token" to get your client access token

## 2. Add Your Token to the App

1. Open `src/services/lyricsAPI.js`
2. Find the line: `const GENIUS_ACCESS_TOKEN = null;`
3. Replace `null` with your token: `const GENIUS_ACCESS_TOKEN = 'your-token-here';`

## 3. Features You'll Get

With the Genius API integration:
- **Better search results** - More accurate song matching
- **Rich metadata** - Artist images, song artwork
- **Larger song database** - Access to Genius's extensive catalog
- **International support** - Songs from all countries and languages
- **Artist information** - Detailed artist data

## 4. Without API Token

The app works perfectly without a Genius token:
- Uses popular song presets
- Falls back to lyrics.ovh API
- Sample lyrics for practice
- Full typing test functionality

## 5. Current Implementation

The app now:
1. **Searches Genius API** for song metadata (if token available)
2. **Uses lyrics.ovh API** to fetch actual lyrics
3. **Falls back to sample lyrics** if both fail
4. **Provides rich search results** with artist and song info
5. **Supports international songs** with language detection

Your typing test is now powered by the industry-leading Genius database! 🎵

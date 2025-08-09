// Lyrics API service using lyrics.ovh
const LYRICS_API_BASE = 'https://api.lyrics.ovh/v1';

// Popular songs as default options
export const popularSongs = [
  { artist: 'Ed Sheeran', title: 'Shape of You' },
  { artist: 'Adele', title: 'Hello' },
  { artist: 'The Weeknd', title: 'Blinding Lights' },
  { artist: 'Billie Eilish', title: 'Bad Guy' },
  { artist: 'Post Malone', title: 'Circles' },
  { artist: 'Dua Lipa', title: 'Levitating' },
  { artist: 'Harry Styles', title: 'As It Was' },
  { artist: 'Taylor Swift', title: 'Shake It Off' },
  { artist: 'Bruno Mars', title: 'Uptown Funk' },
  { artist: 'Imagine Dragons', title: 'Believer' }
];

// Fetch lyrics from API
export const fetchLyrics = async (artist, title) => {
  try {
    const response = await fetch(`${LYRICS_API_BASE}/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`);
    
    if (!response.ok) {
      throw new Error('Song not found');
    }
    
    const data = await response.json();
    return data.lyrics;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
};

// Process lyrics into typing-friendly segments
export const processLyrics = (lyrics) => {
  if (!lyrics) return [];
  
  // Split by lines and filter out empty lines
  const lines = lyrics.split('\n').filter(line => line.trim() !== '');
  
  // Remove common patterns like [Verse], [Chorus], etc.
  const cleanLines = lines.filter(line => !line.match(/^\[.*\]$/));
  
  // Take chunks of 4-6 lines for typing segments
  const segments = [];
  for (let i = 0; i < cleanLines.length; i += 4) {
    const segment = cleanLines.slice(i, i + 4).join(' ').trim();
    if (segment.length > 50 && segment.length < 400) {
      segments.push(segment);
    }
  }
  
  return segments;
};

// Get random song from popular list
export const getRandomSong = () => {
  return popularSongs[Math.floor(Math.random() * popularSongs.length)];
};

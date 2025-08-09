// Enhanced lyrics fetcher using Genius API for search with fallback
const GENIUS_BASE = 'https://api.genius.com';
const LYRICS_API_BASE = 'https://api.lyrics.ovh/v1';

// You can get a client access token from https://genius.com/api-clients
// For now, we'll use the API without authentication for basic search
const GENIUS_ACCESS_TOKEN = null; // Add your Genius API access token here if available

// Sample public domain/traditional songs for fallback
const sampleLyrics = [
  "Happy birthday to you happy birthday to you happy birthday dear friend happy birthday to you",
  "Twinkle twinkle little star how I wonder what you are up above the world so high like a diamond in the sky",
  "Row row row your boat gently down the stream merrily merrily merrily merrily life is but a dream",
  "Mary had a little lamb little lamb little lamb Mary had a little lamb its fleece was white as snow",
  "London bridge is falling down falling down falling down London bridge is falling down my fair lady",
  "The wheels on the bus go round and round round and round round and round the wheels on the bus go round and round all through the town",
  "Old MacDonald had a farm E-I-E-I-O and on his farm he had a cow E-I-E-I-O",
  "If you're happy and you know it clap your hands if you're happy and you know it clap your hands",
  "The itsy bitsy spider climbed up the waterspout down came the rain and washed the spider out"
];

// Popular songs from various languages/artists with English names
const popularSongs = [
  { artist: "Ed Sheeran", title: "Perfect", language: "English" },
  { artist: "Adele", title: "Someone Like You", language: "English" },
  { artist: "Queen", title: "Bohemian Rhapsody", language: "English" },
  { artist: "Beatles", title: "Let It Be", language: "English" },
  { artist: "Coldplay", title: "Fix You", language: "English" },
  { artist: "Bruno Mars", title: "Just The Way You Are", language: "English" },
  { artist: "Taylor Swift", title: "Love Story", language: "English" },
  { artist: "John Lennon", title: "Imagine", language: "English" },
  { artist: "Elvis Presley", title: "Can't Help Falling in Love", language: "English" },
  { artist: "Whitney Houston", title: "I Will Always Love You", language: "English" },
  { artist: "Michael Jackson", title: "Billie Jean", language: "English" },
  { artist: "Bob Dylan", title: "Blowin' in the Wind", language: "English" }
];

export const fetchLyrics = async (artist, title) => {
  try {
    console.log(`Fetching lyrics for: ${artist} - ${title}`);
    
    // First, try to get song info from Genius API
    const songInfo = await searchGeniusForSong(artist, title);
    
    if (songInfo) {
      console.log(`Found song on Genius: ${songInfo.full_title}`);
      // Try to get lyrics from lyrics API using the exact song info
      const lyrics = await fetchLyricsFromAPI(songInfo.primary_artist.name, songInfo.title);
      if (lyrics !== getRandomSampleLyrics()) {
        return lyrics;
      }
    }
    
    // Fallback: Try original artist and title with lyrics API
    console.log('Trying direct lyrics API approach...');
    const directLyrics = await fetchLyricsFromAPI(artist, title);
    if (directLyrics !== getRandomSampleLyrics()) {
      return directLyrics;
    }
    
    throw new Error('No lyrics found from any source');
  } catch (error) {
    console.log('All lyrics fetching failed:', error.message);
    console.log('Using fallback sample lyrics');
    return getRandomSampleLyrics();
  }
};

const searchGeniusForSong = async (artist, title) => {
  try {
    const query = `${artist} ${title}`;
    const encodedQuery = encodeURIComponent(query);
    
    let url = `${GENIUS_BASE}/search?q=${encodedQuery}`;
    
    const headers = {
      'Accept': 'application/json',
    };
    
    // Add authorization if token is available
    if (GENIUS_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${GENIUS_ACCESS_TOKEN}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Genius API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.response && data.response.hits && data.response.hits.length > 0) {
      // Find the best match
      const hits = data.response.hits;
      
      // Try to find exact artist match first
      const exactMatch = hits.find(hit => 
        hit.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase()) &&
        hit.result.title.toLowerCase().includes(title.toLowerCase())
      );
      
      if (exactMatch) {
        return exactMatch.result;
      }
      
      // Return first result if no exact match
      return hits[0].result;
    }
    
    return null;
  } catch (error) {
    console.log('Genius search failed:', error.message);
    return null;
  }
};

const fetchLyricsFromAPI = async (artist, title) => {
  try {
    const cleanArtist = encodeURIComponent(artist.trim());
    const cleanTitle = encodeURIComponent(title.trim());
    
    const response = await fetch(`${LYRICS_API_BASE}/${cleanArtist}/${cleanTitle}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Lyrics API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.lyrics || data.lyrics.trim() === '') {
      throw new Error('No lyrics found in response');
    }
    
    return cleanLyrics(data.lyrics);
  } catch (error) {
    console.log('Lyrics API fetch failed:', error.message);
    return getRandomSampleLyrics();
  }
};

export const searchSongs = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      return getPopularSongs();
    }
    
    console.log(`Searching Genius for: ${query}`);
    
    const encodedQuery = encodeURIComponent(query.trim());
    let url = `${GENIUS_BASE}/search?q=${encodedQuery}`;
    
    const headers = {
      'Accept': 'application/json',
    };
    
    // Add authorization if token is available
    if (GENIUS_ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${GENIUS_ACCESS_TOKEN}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      throw new Error(`Genius API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.response || !data.response.hits || !Array.isArray(data.response.hits)) {
      throw new Error('Invalid search response format');
    }
    
    // Format search results
    const results = data.response.hits.slice(0, 12).map(hit => {
      const song = hit.result;
      return {
        artist: song.primary_artist?.name || 'Unknown Artist',
        title: song.title || 'Unknown Title',
        language: detectLanguage(song.primary_artist?.name || ''),
        full_title: song.full_title || `${song.title} by ${song.primary_artist?.name}`,
        genius_id: song.id,
        artist_image: song.primary_artist?.image_url,
        song_art: song.song_art_image_thumbnail_url
      };
    });
    
    console.log(`Found ${results.length} search results from Genius`);
    return results.length > 0 ? results : getPopularSongs();
  } catch (error) {
    console.log('Genius search failed:', error.message);
    console.log('Returning popular songs as fallback');
    return getPopularSongs();
  }
};

export const getRandomSampleLyrics = () => {
  const randomIndex = Math.floor(Math.random() * sampleLyrics.length);
  return sampleLyrics[randomIndex];
};

export const getPopularSongs = () => {
  return [...popularSongs];
};

// Simple language detection based on artist name patterns
const detectLanguage = (artistName) => {
  const name = artistName.toLowerCase();
  
  // Enhanced language detection
  if (name.includes('bts') || name.includes('blackpink') || name.includes('bigbang') || 
      name.includes('twice') || name.includes('exo') || name.includes('아')) {
    return 'Korean';
  } else if (name.includes('yamada') || name.includes('utada') || name.includes('gackt') ||
             name.includes('あ') || name.includes('ひ')) {
    return 'Japanese';
  } else if (name.includes('jay chou') || name.includes('teresa teng') || name.includes('王') ||
             name.includes('李') || name.includes('张')) {
    return 'Chinese';
  } else if (name.includes('kumar') || name.includes('khan') || name.includes('sharma') ||
             name.includes('singh') || name.includes('bollywood')) {
    return 'Hindi';
  } else if (name.includes('maluma') || name.includes('shakira') || name.includes('manu chao') ||
             name.includes('jesse') || name.includes('garcía')) {
    return 'Spanish';
  } else if (name.includes('céline') || name.includes('stromae') || name.includes('indila') ||
             name.includes('daft punk') || name.includes('édith')) {
    return 'French';
  } else if (name.includes('rammstein') || name.includes('kraftwerk') || name.includes('nena') ||
             name.includes('tokio hotel')) {
    return 'German';
  }
  
  return 'English';
};

const cleanLyrics = (lyrics) => {
  if (!lyrics) return getRandomSampleLyrics();
  
  // Clean and format lyrics
  return lyrics
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\[.*?\]/g, '') // Remove verse markers like [Verse 1]
    .replace(/\(.*?\)/g, '') // Remove parentheses content
    .replace(/\{.*?\}/g, '') // Remove curly braces content
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/[^\w\s.,!?'-]/g, '') // Remove special characters except basic punctuation
    .trim()
    .toLowerCase()
    .slice(0, 350) // Limit to reasonable length for typing
    .replace(/\s+$/, ''); // Remove trailing spaces
};

// Musixmatch API integration
// Note: For production use, you need to register for an API key at developer.musixmatch.com

const MUSIXMATCH_BASE_URL = 'https://api.musixmatch.com/ws/1.1';

// For development/testing, we'll use publicly available endpoints
// In production, you would use your registered API key
const API_KEY = 'demo'; // Replace with your actual API key

export const searchTracks = async (query) => {
  try {
    console.log(`Searching Musixmatch for: ${query}`);
    
    // Search for tracks
    const searchUrl = `${MUSIXMATCH_BASE_URL}/track.search?apikey=${API_KEY}&q=${encodeURIComponent(query)}&page_size=10&page=1&s_track_rating=desc`;
    
    const response = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Musixmatch search response:', data);

    if (data.message && data.message.body && data.message.body.track_list) {
      return data.message.body.track_list.map(item => ({
        id: item.track.track_id,
        title: item.track.track_name,
        artist: item.track.artist_name,
        album: item.track.album_name,
        duration: item.track.track_length,
        explicit: item.track.explicit,
        has_lyrics: item.track.has_lyrics,
        musixmatch_id: item.track.track_id
      }));
    }

    return [];
  } catch (error) {
    console.error('Error searching Musixmatch:', error);
    return [];
  }
};

export const getLyrics = async (trackId) => {
  try {
    console.log(`Getting lyrics for track ID: ${trackId}`);
    
    const lyricsUrl = `${MUSIXMATCH_BASE_URL}/track.lyrics.get?apikey=${API_KEY}&track_id=${trackId}`;
    
    const response = await fetch(lyricsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Musixmatch lyrics response:', data);

    if (data.message && data.message.body && data.message.body.lyrics) {
      return data.message.body.lyrics.lyrics_body;
    }

    throw new Error('No lyrics found');
  } catch (error) {
    console.error('Error getting lyrics from Musixmatch:', error);
    throw error;
  }
};

export const searchAndGetLyrics = async (artist, title) => {
  try {
    console.log(`Searching for lyrics: ${artist} - ${title}`);
    
    // First search for the track
    const query = `${artist} ${title}`;
    const tracks = await searchTracks(query);
    
    if (tracks.length === 0) {
      throw new Error(`No tracks found for "${query}"`);
    }

    // Find the best match (first result is usually the best)
    const bestMatch = tracks[0];
    console.log('Best match found:', bestMatch);

    if (!bestMatch.has_lyrics) {
      throw new Error(`No lyrics available for "${bestMatch.title}" by ${bestMatch.artist}`);
    }

    // Get lyrics for the best match
    const lyrics = await getLyrics(bestMatch.id);
    
    if (!lyrics || lyrics.trim().length === 0) {
      throw new Error(`Empty lyrics returned for "${bestMatch.title}"`);
    }

    return {
      lyrics: lyrics.trim(),
      trackInfo: bestMatch
    };

  } catch (error) {
    console.error('Error in searchAndGetLyrics:', error);
    throw error;
  }
};

// Test function to check API connectivity
export const testMusixmatchAPI = async () => {
  try {
    console.log('Testing Musixmatch API connectivity...');
    
    // Test with a popular song
    const testQuery = 'bohemian rhapsody queen';
    const tracks = await searchTracks(testQuery);
    
    if (tracks.length > 0) {
      const track = tracks[0];
      console.log('✅ Musixmatch API is working!');
      console.log('Sample track found:', track);
      
      if (track.has_lyrics) {
        try {
          const lyricsData = await getLyrics(track.id);
          console.log('✅ Lyrics retrieval working!');
          console.log('Sample lyrics (first 100 chars):', lyricsData.substring(0, 100) + '...');
          return {
            success: true,
            message: 'Musixmatch API is working correctly!',
            sampleTrack: track,
            hasLyrics: true
          };
        } catch (lyricsError) {
          console.log('⚠️ Search working, but lyrics retrieval failed:', lyricsError.message);
          return {
            success: true,
            message: 'Search working, but lyrics may need API key for access',
            sampleTrack: track,
            hasLyrics: false,
            error: lyricsError.message
          };
        }
      } else {
        return {
          success: true,
          message: 'API working, but sample track has no lyrics',
          sampleTrack: track,
          hasLyrics: false
        };
      }
    } else {
      return {
        success: false,
        message: 'API accessible but no results found',
        error: 'No tracks returned from search'
      };
    }
  } catch (error) {
    console.error('❌ Musixmatch API test failed:', error);
    return {
      success: false,
      message: 'Musixmatch API test failed',
      error: error.message
    };
  }
};

// Alternative lyrics API service for testing
const ALTERNATIVE_APIS = [
  'https://api.lyrics.ovh/v1',
  'https://some-lyrics-api.p.rapidapi.com', // Example - would need API key
];

// Test function to check API availability
export const testLyricsAPI = async () => {
  const testSongs = [
    { artist: 'Beatles', title: 'Yesterday' },
    { artist: 'Queen', title: 'Bohemian Rhapsody' },
    { artist: 'Adele', title: 'Hello' }
  ];

  console.log('=== Testing Lyrics API Access ===');

  for (const song of testSongs) {
    try {
      const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(song.artist)}/${encodeURIComponent(song.title)}`;
      console.log(`Testing URL: ${url}`);

      // First, test if we can reach the API at all
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        }
      });

      console.log(`Response status: ${response.status}`);
      console.log(`Response headers:`, response.headers);

      if (response.ok) {
        const data = await response.json();
        console.log(`Success! Got data for ${song.artist} - ${song.title}:`, data);
        return { success: true, data, song };
      } else {
        console.log(`Failed with status ${response.status}`);
        const errorText = await response.text();
        console.log(`Error response:`, errorText);
      }
    } catch (error) {
      console.log(`Error testing ${song.artist} - ${song.title}:`, error);
      console.log(`Error type:`, error.name);
      console.log(`Error message:`, error.message);
      
      // Check if it's a CORS error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.log('This appears to be a CORS error - the API might not allow browser requests');
      }
    }
  }

  return { success: false, message: 'All API tests failed' };
};

// Simple lyrics for immediate testing
export const getTestLyrics = () => {
  return "this is a test sentence for typing practice with multiple words to check if the typing test works correctly";
};

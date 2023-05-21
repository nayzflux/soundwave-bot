const SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET,
});

// Get an access token and 'save' it using a setter
spotifyApi.clientCredentialsGrant().then(
    function(data) {
        spotifyApi.setAccessToken(data.body['access_token']);
    },
    function(err) {
        console.log('Something went wrong!', err);
    }
);

export const search = async (query) => {
    const data = await spotifyApi.searchTracks(query)
    const items = data.body.tracks.items;
    return items;
}
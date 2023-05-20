import axios from "axios";
import User from '../models/user';

const CLIENT_ID = process.env.SPOTIFY_ID
const CLIENT_SECRET = process.env.SPOTIFY_SECRET
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URL;

export interface SpotifyCredentials {
    access_token: string;
    token_type: string;
    scope: string;
    expires_at: number;
    expires_in: number;
    refresh_token: string;
}

export const getSpotifyCredentials = async (code: string): Promise<SpotifyCredentials | null> => {
    try {
        const response = await axios.post(`https://accounts.spotify.com/api/token?code=${code}&redirect_uri=${REDIRECT_URI}&grant_type=authorization_code`, {}, {
            headers: {
                //@ts-ignore
                'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
                'Content-Type':'application/x-www-form-urlencoded'
            }
        });

        return { expires_at: Date.now() + (response.data.expires_in * 1000), ...response.data};
    } catch (error) {
        console.log(error.response.status)
        console.log(error.response.data);
        return null;
    }
}

export const refreshSpotifyToken = async (credentials: SpotifyCredentials): Promise<SpotifyCredentials | null> => {
    console.log("refresh spotify token")
    try {
        const response = await axios.post(`https://accounts.spotify.com/api/token?refresh_token=${credentials.refresh_token}&grant_type=refresh_token`, {}, {
            headers: {
                //@ts-ignore
                'Authorization': 'Basic ' + (new Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
                'Content-Type':'application/x-www-form-urlencoded'
            }
        });

        // update in db
        const u = await User.updateOne({"spotifyCredentials.access_token": credentials.access_token}, {"spotifyCredentials.access_token": response.data.access_token, "spotifyCredentials.token_type": response.data.token_type, "spotifyCredentials.expires_in": response.data.expires_in, "spotifyCredentials.expires_at": response.data.expires_at})

        return { ...credentials, ...response.data, expires_at: Date.now()};
    } catch (error) {
        console.log(error.response.data);
        return null;
    }
}

export const isValidSpotifyCredentials = (credentials: SpotifyCredentials): boolean => {
    return credentials.expires_at < Date.now();
}

export interface SpotifyPlaylist {
    "collaborative": boolean,
    "description": string,
    "external_urls": {
        "spotify": string
    },
    "href": string,
    "id": string,
    "images": [
        {
            "url": string,
            "height": number,
            "width": number
        }
    ],
    "name": string,
    "owner": {
        "external_urls": {
            "spotify": string
        },
        "followers": {
            "href": string,
            "total": number
        },
        "href": string,
        "id": string,
        "type": string,
        "uri": string,
        "display_name": string
    },
    "public": boolean,
    "snapshot_id": string,
    "tracks": {
        "href": string,
        "total": number
    },
    "type": string,
    "uri": string
}

export const getCurrentSpotifyUserPlaylists = async (credentials: SpotifyCredentials): Promise<SpotifyPlaylist[] | null> => {
    if (!isValidSpotifyCredentials(credentials)) {
        credentials = await refreshSpotifyToken(credentials)
        if (!credentials) return null;
    }

    try {
        const response = await axios.get(`https://api.spotify.com/v1/me/playlists`, {
            headers: {
                //@ts-ignore
                'Authorization': `Bearer ${credentials.access_token}`
            }
        });

        return response.data.items;
    } catch (error) {
        console.log(error.response.status);
        console.log(error.response.data);
        if (error.response.data.error.message === 'The access token expired') {
            const newCredentials = await refreshSpotifyToken(credentials)
            return await getCurrentSpotifyUserPlaylists(newCredentials);
        }
        return null;
    }
}

export const getPlaylistTracks = async (credentials: SpotifyCredentials, playlistId: string): Promise<any[] | null> => {
    if (!isValidSpotifyCredentials(credentials)) {
        credentials = await refreshSpotifyToken(credentials)
        if (!credentials) return null;
    }

    try {
        const response = await axios.get(`https://api.spotify.com/v1/me/playlists/${playlistId}`, {
            headers: {
                //@ts-ignore
                'Authorization': `Bearer ${credentials.access_token}`
            }
        });

        return response.data.items;
    } catch (error) {
        console.log(error.response.status);
        console.log(error.response.data);
        if (error.response.data.error.message === 'The access token expired') {
            const newCredentials = await refreshSpotifyToken(credentials)
            return await getPlaylistTracks(newCredentials, playlistId);
        }
        return null;
    }
}
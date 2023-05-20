import axios from "axios";
import {SpotifyPlaylist} from "@/types/spotifyPlaylist";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.soundwave.nayz.fr/api/"

export const fetchGuildQueue = async (guildId: string) => {
    console.log(`Fetching guild ${guildId}...`)

    try {
        const response = await axios.get(`${API_URL}/guilds/`+guildId+`/queue`, {withCredentials: true});
        return response;
    } catch (e) {
        return null;
    }
}

export const fetchUserGuilds = async () => {
    console.log(`Fetching user guilds...`)

    try {
        const response = await axios.get(`${API_URL}/guilds`, {withCredentials: true});
        return response?.data;
    } catch (e) {
        return null;
    }
}

export const searchSongs = async (guildId: string, query: string): Promise<{inVoiceChannel: boolean, songs: SearchSong[]} | null> => {
    console.log(`Searching song...`)

    try {
        const response = await axios.get(`${API_URL}/guilds/` + guildId + `/search?q=` + query, {withCredentials: true});
        return response.data;
    } catch (e) {
        return null;
    }
}

export const fetchSpotifyPlaylists = async (): Promise<SpotifyPlaylist[] | null> => {
    console.log(`Fetching spotify playlist...`)

    try {
        const response = await axios.get(`${API_URL}/spotify/playlists`, {withCredentials: true});
        return response.data;
    } catch (e) {
        return null;
    }
}
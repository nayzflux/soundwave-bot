/**
 * @author NayZ
 * Fichier qui gère ce qui est relatif à Spotify
 */

import fs from 'fs';
import Spotify from 'spotifydl-core';
import { clearText } from './music';

const spotify = new Spotify({
    clientId: process.env.SPOTIFY_ID,
    clientSecret: process.env.SPOTIFY_SECRET
});

// Ou les fichiers seront télécharger
const DOWNLOAD_PATH = `./temp/musics/`;

export const searchSpotifySong = async (url: string): Promise<MySong> => {
    const track = await spotify.getTrack(url);
    if (!track) return null;
    return { url: url, title: track.name, authors: track.artists.toString() };
}

export const searchSpotifyPlaylist = async (url: string): Promise<MyPlaylist> => {
    const { name, total_tracks, tracks } = await spotify.getTracksFromPlaylist(url);
    return { url: url, title: name, totalSongs: total_tracks, songs: tracks.map(track => ({ url: null, title: track.name, authors: track.artists.toString() })) };
}

export const downloadSpotifySong = async (song: MySong) => {
    console.log(`⏬ Downloading song ${song.title}...`);

    // Si la musique n'a pas déjà été télécharger
    if (!fs.existsSync(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`)) {
        const buffer = await spotify.downloadTrack(song.url);
        fs.writeFileSync(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`, buffer);
    }

    console.log(`⏬ Download song ${song.title} completed!`);
}

export const downloadSpotifyPlaylist = async (playlist: MyPlaylist) => {
    console.log(`⏬ Downloading playlist ${playlist.title}...`);

    const buffers = await spotify.downloadPlaylist(playlist.url);
    let i = 0;

    for (const buffer of buffers) {
        const song = playlist.songs[i];

        // Si la musique n'a pas déjà été télécharger
        if (!fs.existsSync(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`)) {
            fs.writeFileSync(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`, buffer);
        }

        i++;
    }

    console.log(`⏬ Download playlist ${playlist.title} completed!`);
}
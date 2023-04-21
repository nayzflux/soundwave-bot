/**
 * @author NayZ
 * Fichier qui gère ce qui est relatif à YouTube
 */

import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';
import { clearText } from './music';

// Ou les fichiers seront télécharger
const DOWNLOAD_PATH = `./temp/musics/`;

export const searchYoutubeSong = async (query): Promise<MySong> => {
    const results = await yts({ query });
    const video = results?.videos[0]

    if (!video) {
        return null;
    }

    return { url: video.url, title: video.title, authors: video.author.name }
}

export const downloadYoutubeSog = (song: MySong) => {
    ytdl(song.url, { quality: 'highestaudio', filter: 'audioonly'})
        .pipe(fs.createWriteStream(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`));
}
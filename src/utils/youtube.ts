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
    console.log(video.thumbnail)

    return { url: video.url, title: video.title, authors: video.author.name, name: video.title, coverUrl: video.thumbnail, durationMs: convertToMs(video.duration.timestamp) }
}

export const downloadYoutubeSog = (song: MySong) => {
    console.log(`⏬ Downloading song ${song.title}...`);

    // Si la musique n'a pas déjà été télécharger alors le faires
    if (!fs.existsSync(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`)) {
        const stream = ytdl(song.url, { quality: 'highestaudio', filter: 'audioonly' });
        stream.pipe(fs.createWriteStream(`${DOWNLOAD_PATH}${clearText(song.title)}.mp3`));
    }

    console.log(`⏬ Download song ${song.title} completed!`);
    return;
}

function convertToMs(time: string): number {
    const [hours, minutes, seconds] = time.split(':').map(Number);

    if (isNaN(hours)) {
        return minutes * 60000 + seconds * 1000;
    }

    return hours * 3600000 + minutes * 60000 + seconds * 1000;
}
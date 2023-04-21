/**
 * @author NayZ
 * Fichier racine du projet
 */

import * as dotenv from 'dotenv' // only in dev
dotenv.config({ path: '.env' })

import { Client } from 'discord.js';
import { play } from './utils/music';
import { downloadSpotifyPlaylist, downloadSpotifySong, searchSpotifyPlaylist, searchSpotifySong } from './utils/spotify';
import { downloadYoutubeSog, searchYoutubeSong } from './utils/youtube';

const client = new Client({
    intents: 3276799
});

client.on('messageCreate', async (message) => {
    const args = message.content.split(' ').slice(1);

    if (message.content.startsWith('!play')) {
        if (!message.member.voice) {
            message.reply('❌ You need to be in voice channel!');
            return;
        }

        // Si c'est un lien
        if (args.length == 1 && args[0].startsWith("https://")) {
            const url = args[0];

            // Track URL
            if (url.startsWith("https://open.spotify.com/track/")) {
                const response = await message.reply(`⌛ We're searching your song, please wait...`);
                const song: MySong = await searchSpotifySong(url);

                if (!song) {
                    response.edit(`❌ We can't find your song!`);
                    return;
                }

                response.edit(`⏬ We're downloading your song, please wait...`);
                await downloadSpotifySong(song);
                play(message.member.voice.channel, song);
                response.edit(`🎶 Playing song : **${song.title}** by **${song.authors}**!`);
                return;
            }

            // Playlist URL
            if (url.startsWith("https://open.spotify.com/playlist/")) {
                const response = await message.reply(`⌛ We're searching your playlist, please wait...`);
                const playlist: MyPlaylist = await searchSpotifyPlaylist(url);

                if (!playlist) {
                    response.edit(`❌ We can't find your playlist!`);
                    return;
                }

                response.edit(`⏬ We're downloading your playlist, please wait...`);
                await downloadSpotifyPlaylist(playlist);
                for (const song of playlist.songs) {
                    play(message.member.voice.channel, song);
                }
                response.edit(`🎶 Playing playlist : **${playlist.title}** with **${playlist.totalSongs} songs**!`);

                return;
            }
        }

        const response = await message.reply(`⌛ We're searching your song, please wait...`);
        const song: MySong = await searchYoutubeSong(args.toString().replaceAll(", ", " "));

        if (!song) {
            response.edit(`❌ We can't find your song!`);
            return;
        }

        response.edit(`⏬ We're downloading your song, please wait...`);
        downloadYoutubeSog(song);
        play(message.member.voice.channel, song);
        response.edit(`🎶 Playing song : **${song.title}** by **${song.authors}**!`);
        return;
    }
});

client.login(process.env.DISCORD_TOKEN);
/**
 * @author NayZ
 * Fichier racine du projet
 */

import * as dotenv from "dotenv"; // only in dev
dotenv.config({ path: ".env" });

import { ChannelType, Client } from "discord.js";
import {
  clear,
  getQueue,
  init,
  isPaused,
  isPlaying,
  play,
  skip,
  stop,
  togglePause,
} from "./utils/music";
import {
  downloadSpotifyPlaylist,
  downloadSpotifySong,
  searchSpotifyPlaylist,
  searchSpotifySong,
} from "./utils/spotify";
import { downloadYoutubeSog, searchYoutubeSong } from "./utils/youtube";

const client = new Client({
  intents: 3276799,
});

client.on("messageCreate", async (message) => {
  const cmd = message.content.split(" ")[0];
  const args = message.content.split(" ").slice(1);

  if (message.author.bot) return;
  if (message.channel.type === ChannelType.DM) return;
  if (!cmd) return;

  // ===== ANCIENNE COMMANDE =====

  // !play commande
  if (cmd === "!play") {
    if (!message.member.voice?.channel) {
      message.reply("❌ You need to be in voice channel!");
      return;
    }

    // Si c'est un lien
    if (args.length == 1 && args[0].startsWith("https://open.spotify.com/")) {
      const url = args[0];

      const parsedUrl = url.split("/");

      const type = parsedUrl[parsedUrl.length - 2];

      // Track URL
      if (type === "track") {
        const response = await message.reply(
          `⌛ We're searching your song, please wait...`
        );
        const song: MySong = await searchSpotifySong(url);

        if (!song) {
          response.edit(`❌ We can't find your song!`);
          return;
        }

        response.edit(`⏬ We're downloading your song, please wait...`);
        await downloadSpotifySong(song);
        play(message.member.voice.channel, song);
        response.edit(
          `🎶 Playing song : **${song.title}** by **${song.authors}**!`
        );
        return;
      }

      // Playlist URL
      if (type === "playlist") {
        const response = await message.reply(
          `⌛ We're searching your playlist, please wait...`
        );
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
        response.edit(
          `🎶 Playing playlist : **${playlist.title}** with **${playlist.totalSongs} songs**!`
        );

        return;
      }

      message.reply(
        `❌ Spotify album isn't supported yet, please use track links or playlist links!`
      );
      return;
    }

    const response = await message.reply(
      `⌛ We're searching your song, please wait...`
    );
    const song: MySong = await searchYoutubeSong(
      args.toString().replaceAll(", ", " ")
    );

    if (!song) {
      response.edit(`❌ We can't find your song!`);
      return;
    }

    response.edit(`⏬ We're downloading your song, please wait...`);
    downloadYoutubeSog(song);
    // Attendre 1s pour eviter de lire le fichier a peine écrit / Wait 1s to avoid empty file
    setTimeout(() => {
      console.log("play");
      play(message.member.voice.channel, song);
      response.edit(
        `🎶 Playing song : **${song.title}** by **${song.authors}**!`
      );
    }, 1_000);
    return;
  }

  // !stop commande
  if (cmd === "!stop") {
    if (!isPlaying(message.guildId)) {
      message.reply(`❌ Currently not playing!`);
      return;
    }

    stop(message.guildId);
    message.reply(`⏹️ Playing stopped!`);
    return;
  }

  // !skip commande
  if (cmd === "!skip") {
    if (!isPlaying(message.guildId)) {
      message.reply(`❌ Currently not playing!`);
      return;
    }

    if (parseInt(args[0])) {
      skip(message.guildId, parseInt(args[0]));
      message.reply(`⏭️ ${args[0]} songs skipped!`);
    } else {
      skip(message.guildId, 1);
      message.reply(`⏭️ Song skipped!`);
    }

    return;
  }

  // !clear commande
  if (cmd === "!clear") {
    if (!isPlaying(message.guildId)) {
      message.reply(`❌ Currently not playing!`);
      return;
    }

    clear(message.guildId);
    message.reply(`🗑️ Queue cleared!`);
    return;
  }

  // !pause commande
  if (cmd === "!pause") {
    if (!isPlaying(message.guildId)) {
      message.reply(`❌ Currently not playing!`);
      return;
    }

    togglePause(message.guildId);

    if (isPaused(message.guildId)) {
      message.reply(`⏯️ Song paused!`);
    } else {
      message.reply(`⏯️ Song resumed!`);
    }

    return;
  }

  // !queue commande
  if (cmd === "!queue") {
    if (!isPlaying(message.guildId)) {
      message.reply(`❌ Currently not playing!`);
      return;
    }

    console.log(getQueue(message.guildId).resources.length);
    message.reply(`${getQueue(message.guildId).toString()}`);
    return;
  }
});

export const getVoiceChannel = async (memberId, guildId) => {
  try {
    const guild = await client.guilds.fetch(guildId);
    if (!guild) return null;

    const member = await guild.members.fetch(memberId);
    if (!member) return null;

    if (!member.voice?.channel) return null;

    return member.voice.channel;
  } catch (err) {
    console.log(err);
    return null;
  }
};

init(); // init music.ts

// START DASHBOARD API
import "./dashboard/api/index";

client.login(process.env.DISCORD_TOKEN);

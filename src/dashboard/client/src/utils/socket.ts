import { io } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://api.soundwave.nayz.fr/"

export const socket = io(WS_URL, {
    autoConnect: true,
    withCredentials: true
})

export const onPlay = (guildId: string) => {
    console.log("Request playing...")
    socket.emit('play', (guildId));
}

export const onPause = (guildId: string) => {
    console.log("Request pausing...")
    socket.emit('pause', (guildId));
}

export const onSkip = (guildId: string) => {
    console.log("Request skipping...")
    socket.emit('skip', (guildId));
}

export const onStop = (guildId: string) => {
    console.log("Request stopping...")
    socket.emit('stop', (guildId));
}

export const onClear = (guildId: string) => {
    console.log("Request clearing...")
    socket.emit('clear', (guildId));
}

export const onAddSong = (guildId: string, songUrl: string) => {
    console.log("Request add song...")
    socket.emit('add_song', guildId, songUrl);
}

export const onAddPlaylist = (guildId: string, playlistUrl: string) => {
    console.log("Request add playlist...")
    socket.emit('add_playlist', guildId, playlistUrl);
}
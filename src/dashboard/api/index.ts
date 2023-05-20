import bodyParser from 'body-parser';
import express from 'express';
import { getCredentials, getCurrentUser, getMutualGuilds } from './utils/discord';

import './utils/db';
import User from './models/user';
import {clear, getQueue, isPlaying, play, skip, stop, togglePause} from '../../utils/music';
import cors from 'cors';
import * as http from "http";
import jwt from 'jsonwebtoken'
import {search} from "../../utils/spotifyWebApi.js";
import {
    downloadSpotifyPlaylist,
    downloadSpotifySong,
    searchSpotifyPlaylist,
    searchSpotifySong
} from "../../utils/spotify";
import {isAuth} from "./middlewares/auth";
import cookieParser from 'cookie-parser'
import {getVoiceChannel} from "../../index";
import {getCurrentSpotifyUserPlaylists, getSpotifyCredentials, SpotifyCredentials} from "./utils/spotify";

const app = express();

const server = http.createServer(app);

app.use(cors({origin: process.env.CLIENT_URL, credentials: true}))

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded());

app.get('/api/spotify/login', isAuth, (req, res) => {
    res.redirect(process.env.SPOTIFY_OAUTH_URL);
});

app.get('/api/spotify/callback', isAuth, async (req, res) => {
    const { code } = req.query;
    // @ts-ignore
    const self = req.self;

    console.log("Spotify Code granted - " + code);
    const credentials: SpotifyCredentials = await getSpotifyCredentials(code.toString());

    console.log(credentials)

    if (!credentials?.access_token) {
        //res.redirect("/api/spotify/login");
        return;
    }

    await User.updateOne({id: self.id}, {spotifyCredentials: credentials});

    res.status(200).json({message: 'ok spotify credentials'})
});

app.get('/api/spotify/playlists', isAuth, async (req, res) => {
    // @ts-ignore
    const self = req.self;

    const playlist = await getCurrentSpotifyUserPlaylists(self.spotifyCredentials);
    res.status(200).json(playlist)
});

app.get('/api/auth/login', (req, res) => {
    res.redirect(process.env.DISCORD_OAUTH_URL);
});


app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    console.log("Dashboard API: Code granted - " + code);
    const credentials = await getCredentials(code.toString());

    if (!credentials?.access_token) {
        // res.status(400).json({ error: "Invalid code retry at http://localhost:5000/api/auth/login !" });
        res.redirect("/api/auth/login");
        return;
    }

    const userInfo = await getCurrentUser(credentials.access_token, "null");

    const { email, username, id } = userInfo;


    if (!email || !username || !id) {
        res.status(404).json({ error: "Can't find user!" });
        return;
    }

    if (await User.exists({ id })) {
        const user = await User.findOneAndUpdate({id}, { email, username, credentials }, {new: true});
        const token = signToken(user);
        console.log(`Dashboard API: User updated`, user);
        res.status(200).cookie('jwt', token, {maxAge: 30 * 24 * 60 * 60 * 1000}).redirect('http://localhost:3000')
        return;
    } else {
        const user = await User.create({ id, email, username, credentials });
        const token = signToken(user);
        console.log(`Dashboard API: User created`, user);
        res.cookie('jwt', token, {maxAge: 30 * 24 * 60 * 60 * 1000}).redirect('http://localhost:3000')
        return;
    }
});

function signToken(user) {
    try {
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '30d'});
        return token;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded;
    } catch (err) {
        return null;
    }
}

// Get All User Accessable Guild
app.get('/api/guilds', isAuth, async (req, res) => {
    // @ts-ignore
    const self = req.self;
    // @ts-ignore
    const mutuals = req.mutuals;

    if (!mutuals) {
        res.redirect("/api/auth/login");
        return;
    }

    return res.json(mutuals);
});

// Get Guild queue
app.get('/api/guilds/:guild_id/queue', isAuth, async (req, res) => {
    const { guild_id } = req.params;

    // @ts-ignore
    const self = req.self;
    // @ts-ignore
    const mutuals = req.mutuals;
    if (!mutuals.map(g => g.id).includes(guild_id)) return res.status(403).json({ message: "Not allowed : You're not on this server" });

    if (!isPlaying(guild_id)) {
        res.status(400).json({ message: "Currently not playing" });
        return;
    }

    /**
     * BESOIN DE CHANGER LE SYSTEME QUE FILE D'ATTENTE
     */
    const queue = getQueue(guild_id);

    res.status(200).json({songs: queue.songs, isPlaying: queue.isPlaying});
    return;
});

// Search song
app.get('/api/guilds/:guildId/search', isAuth, async (req, res) => {
    const { q } = req.query;
    const {guildId} = req.params;

    // @ts-ignore
    const self = req.self;
    // @ts-ignore
    const mutuals = req.mutuals;
    if (!mutuals.map(g => g.id).includes(guildId)) return res.status(403).json({ message: "Not allowed : You're not on this server" });

    // @ts-ignore
    const discordUser = req.discordUser;

    const voiceChannel = await getVoiceChannel(discordUser.id, guildId);

    if (!q || q === '') return res.status(200).json({songs: [], inVoiceChannel: (!!voiceChannel)});

    const songs = await search(q.toString());

    res.status(200).json({songs, inVoiceChannel: (!!voiceChannel)});
    return;
});

/**
 // Skip guild song
app.patch('/api/guilds/:guild_id/queue/skip/:amount', async (req, res) => {
    const { guild_id, amount } = req.params;

    if (!parseInt(amount)) {
        res.status(400).json({ error: 'amount must be an integer' })
        return;
    }

    if (!isPlaying(guild_id)) {
        res.status(400).json({ message: "Currently not playing" });
        return;
    }

    skip(guild_id, parseInt(amount));
    const queue = getQueue(guild_id);

    res.status(200).json({ message: "Skipped " + amount + " song(s)", songs: queue.songs });
    return;
});

// Clear guild song
app.patch('/api/guilds/:guild_id/queue/clear', async (req, res) => {
    const { guild_id } = req.params;

    if (!isPlaying(guild_id)) {
        res.status(400).json({ message: "Currently not playing" });
        return;
    }

    clear(guild_id);
    const queue = getQueue(guild_id);

    res.status(200).json({ message: "Clear", songs: queue.songs });
    return;
});

// Clear guild song
app.patch('/api/guilds/:guild_id/queue/pause', async (req, res) => {
    const { guild_id } = req.params;

    console.log("ok");
    

    if (!isPlaying(guild_id)) {
        res.status(400).json({ message: "Currently not playing" });
        return;
    }

    togglePause(guild_id);
    const queue = getQueue(guild_id);

    res.status(200).json({ message: "Paused/Unpaused", songs: queue.songs });
    return;
});


// Stop
app.delete('/api/guilds/:guild_id/queue', async (req, res) => {
    const { guild_id } = req.params;

    if (!isPlaying(guild_id)) {
        res.status(400).json({ message: "Currently not playing" });
        return;
    }

    stop(guild_id);

    res.status(200).json({ message: "Stopped" });
    return;
});**/

const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true
    }
});

function getCookie(cookie, cName) {
    const name = cName + "=";
    const cDecoded = decodeURIComponent(cookie);
    const cArr = cDecoded.split(';');
    let res;
    cArr.forEach(val => {
        if (val.indexOf(name) === 0) res = val.substring(name.length);
    })
    return res;
}

// Handle auth
io.use(async (socket, next) => {
    console.log("[WS] Auth...")
    const token = getCookie(socket.handshake.headers.cookie, "jwt"); // check if token in header

    // Si l'utilisateur n'a pas de token
    if (!token) return next(new Error("Authentification requise"));

    // Décoder le token et verifié sa validité
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error("Authentification requise"));

    // Récupérer l'utilisateur connecter dans la base de donné
    const self = await User.findOne({ id: decoded.id });

    console.log(self.username)

    // Vérifier si l'utilisateur n'a pas été supprimer
    if (!self) return next(new Error("Authentification requise"));

    const discordUser = await getCurrentUser(self.credentials.access_token, self.id);

    // Stockage des informations d'authentification dans l'objet req pour les fonctions suivantes
    socket.self = self;
    socket.discordUser = discordUser;

    console.log(`Authentifié en tant que ${self.username}`);
    return next();
});

io.on('connection', (socket) => {
    console.log(`${socket.discordUser.username} connected`)

    socket.on("disconnect", () => {
        console.log(`${socket.discordUser.username} disconnected`)
    });

    socket.on("stop", async (guildId) => {
        console.log("WS: stop requested")
        const voiceChannel = await getVoiceChannel(socket.discordUser.id, guildId);

        if (!voiceChannel) return;
        stop(guildId)
    })

    socket.on("play", async (guildId) => {
        console.log("WS: play requested")
        const voiceChannel = await getVoiceChannel(socket.discordUser.id, guildId);

        if (!voiceChannel) return;
        togglePause(guildId)
    })

    socket.on("pause", async (guildId) => {
        console.log("WS: pause requested")
        const voiceChannel = await getVoiceChannel(socket.discordUser.id, guildId);

        if (!voiceChannel) return;
        togglePause(guildId)
    })

    socket.on("skip", async (guildId) => {
        console.log("WS: skip requested")
        const voiceChannel = await getVoiceChannel(socket.discordUser.id, guildId);

        if (!voiceChannel) return;
        skip(guildId, 1)
    })

    socket.on("clear", async (guildId) => {
        console.log("WS: clear requested")
        const voiceChannel = await getVoiceChannel(socket.discordUser.id, guildId);

        if (!voiceChannel) return;
        clear(guildId)
    })


    socket.on('add_song', async (guildId, songUrl) => {
        console.log("WS: add song requested")

        const voiceChannel = await getVoiceChannel(socket.discordUser.id, guildId);

        if (!voiceChannel) return;

        const song: MySong = await searchSpotifySong(songUrl);
        await downloadSpotifySong(song);

        play(voiceChannel, song);
    })
    socket.on('add_playlist', async (guildId, playlistUrl) => {
        console.log("WS: add playlist requested")

        const voiceChannel = await getVoiceChannel(socket.discordUser.id, guildId);

        if (!voiceChannel) return;

        const playlist: MyPlaylist = await searchSpotifyPlaylist(playlistUrl);
        await downloadSpotifyPlaylist(playlist);

        for (const song of playlist.songs) {
            play(voiceChannel, song);
        }
    })

});

export const onPlay = (guildId, queue) => {
    io.emit('play', guildId, {songs: queue.songs, isPlaying: true});
}

export const onPause = (guildId, queue) => {
    io.emit('pause', guildId, {songs: queue.songs, isPlaying: false});
}

export const onSkip = (guildId, queue) => {
    io.emit('skip', guildId, {songs: queue.songs, isPlaying: queue.isPlaying});
}

export const onClear = (guildId, queue) => {
    io.emit('clear', guildId, {songs: queue.songs, isPlaying: queue.isPlaying});
}

export const onStop = (guildId) => {
    io.emit('stop', guildId, guildId, {songs: [], isPlaying: false});
}

server.listen(5000, () => console.log("API Server listening port : 5000"));

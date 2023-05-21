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
import {resolveMutualGuilds} from "./middlewares/guild";

import rateLimit from 'express-rate-limit'



const app = express();

const server = http.createServer(app);

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers,
    message: "You are being rate limited retry in 15 minutes",
})

app.set('trust proxy', 1)
app.get('/ip', (request, response) => response.send(request.ip))

app.use(limiter)

app.use(cors({origin: process.env.CLIENT_URL, credentials: true}))

app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded());

app.get('/api/spotify/login', isAuth, (req, res) => {
    console.log("Dashboard API - Redirect to Spotify oauth url");
    res.redirect(process.env.SPOTIFY_OAUTH_URL);
});

app.get('/api/spotify/callback', isAuth, async (req, res) => {
    const { code } = req.query;
    // @ts-ignore
    const self = req.self;

    console.log("Dashboard API - Spotify code granted");

    const credentials: SpotifyCredentials = await getSpotifyCredentials(code.toString());

    if (!credentials?.access_token) {
        res.redirect("/api/spotify/login");
        return;
    }

    await User.updateOne({id: self.id}, {spotifyCredentials: credentials});
    console.log(`Dashboard API - User updated`);

    res.redirect(process.env.CLIENT_URL)
    //res.status(200).json({message: 'ok spotify credentials'})
});

app.get('/api/spotify/playlists', isAuth, async (req, res) => {
    // @ts-ignore
    const self = req.self;

    const playlist = await getCurrentSpotifyUserPlaylists(self.spotifyCredentials);
    res.status(200).json(playlist)
});

app.get('/api/auth/login', (req, res) => {
    console.log("Dashboard API - Redirect to Discord oauth url");
    res.redirect(process.env.DISCORD_OAUTH_URL);
});


app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;

    console.log("Dashboard API - Discord code granted");

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
        console.log(`Dashboard API - User updated`);
        res.status(200).cookie('jwt', token, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', secure: true}).redirect(process.env.CLIENT_URL)
        return;
    } else {
        const user = await User.create({ id, email, username, credentials });
        const token = signToken(user);
        console.log(`Dashboard API - User created`);
        res.cookie('jwt', token, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', secure: true}).redirect(process.env.CLIENT_URL)
        return;
    }
});

function signToken(user) {
    try {
        const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: '30d'});
        console.log(`Dashboard API - Token signed`);
        return token;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(`Dashboard API - Token decoded`);
        return decoded;
    } catch (err) {
        return null;
    }
}

// Get All User Accessable Guild
app.get('/api/guilds', isAuth, resolveMutualGuilds, async (req, res) => {
    // @ts-ignore
    const self = req.self;
    // @ts-ignore
    const mutuals = req.mutuals;

    if (mutuals.length === 0) return res.status(404).json({success: false, code: 404});

    return res.json(mutuals);
});

// Get Guild queue
app.get('/api/guilds/:guild_id/queue', isAuth, resolveMutualGuilds, async (req, res) => {
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
app.get('/api/guilds/:guildId/search', isAuth, resolveMutualGuilds, async (req, res) => {
    const { q } = req.query;
    const {guildId} = req.params;

    // @ts-ignore
    const self = req.self;
    // @ts-ignore
    const mutuals = req.mutuals;
    if (!mutuals.map(g => g.id).includes(guildId)) return res.status(403).json({ message: "Not allowed : You're not on this server" });

    const voiceChannel = await getVoiceChannel(self.id, guildId);

    if (!voiceChannel) return res.status(400).json({success: false, code: 400, message: "You're not on voice channel"});

    const songs = await search(q.toString());

    res.status(200).json(songs);
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
    console.log("WS: Authentication...")
    const token = getCookie(socket.handshake.headers.cookie, "jwt"); // check if token in header

    // Si l'utilisateur n'a pas de token
    if (!token) return next(new Error("Authentification requise"));

    // Décoder le token et verifié sa validité
    const decoded = verifyToken(token);
    if (!decoded) return next(new Error("Authentification requise"));

    // Récupérer l'utilisateur connecter dans la base de donné
    const self = await User.findOne({ id: decoded.id });

    // Vérifier si l'utilisateur n'a pas été supprimer
    if (!self) return next(new Error("Authentification requise"));

    // Stockage des informations d'authentification dans l'objet req pour les fonctions suivantes
    socket.self = self;

    console.log(`WS: Authentifié en tant que ${self.username}`);
    return next();
});

io.on('connection', (socket) => {
    console.log(`${socket.self.username} connected`)

    socket.on("disconnect", () => {
        console.log(`${socket.self.username} disconnected`)
    });

    socket.on("stop", async (guildId) => {
        console.log("WS: stop requested")
        const voiceChannel = await getVoiceChannel(socket.self.id, guildId);

        if (!voiceChannel) return;
        stop(guildId)
    })

    socket.on("play", async (guildId) => {
        console.log("WS: play requested")
        const voiceChannel = await getVoiceChannel(socket.self.id, guildId);

        if (!voiceChannel) return;
        togglePause(guildId)
    })

    socket.on("pause", async (guildId) => {
        console.log("WS: pause requested")
        const voiceChannel = await getVoiceChannel(socket.self.id, guildId);

        if (!voiceChannel) return;
        togglePause(guildId)
    })

    socket.on("skip", async (guildId) => {
        console.log("WS: skip requested")
        const voiceChannel = await getVoiceChannel(socket.self.id, guildId);

        if (!voiceChannel) return;
        skip(guildId, 1)
    })

    socket.on("clear", async (guildId) => {
        console.log("WS: clear requested")
        const voiceChannel = await getVoiceChannel(socket.self.id, guildId);

        if (!voiceChannel) return;
        clear(guildId)
    })


    socket.on('add_song', async (guildId, songUrl) => {
        console.log("WS: add song requested")

        const voiceChannel = await getVoiceChannel(socket.self.id, guildId);

        if (!voiceChannel) return;

        const song: MySong = await searchSpotifySong(songUrl);
        await downloadSpotifySong(song);

        play(voiceChannel, song);
    })
    socket.on('add_playlist', async (guildId, playlistUrl) => {
        console.log("WS: add playlist requested")

        const voiceChannel = await getVoiceChannel(socket.self.id, guildId);

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

import bodyParser from 'body-parser';
import express from 'express';
import { getCredentials, getCurrentUser, getMutualGuilds } from './utils/discord';

import './utils/db';
import User from './models/user';
import { clear, getQueue, isPlaying, skip, stop } from '../../utils/music';

const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded());

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

    console.log(credentials);
    const userInfo = await getCurrentUser(credentials.access_token);
    console.log(userInfo);

    const { email, username, id } = userInfo;


    if (!email || !username || !id) {
        res.status(404).json({ error: "Can't find user!" });
        return;
    }

    if (await User.exists({ id })) {
        const user = await User.findByIdAndUpdate({ id, email, username, credentials });
        console.log(`Dashboard API: User updated`, user);
        res.status(200).json({ message: 'User updated' })
        return;
    } else {
        const user = await User.create({ id, email, username, credentials });
        console.log(`Dashboard API: User created`, user);
        res.status(200).json({ message: 'User created' })
        return;
    }
});

// Get All User Accessable Guild
app.get('/api/guilds', async (req, res) => {
    const { access_token } = res.locals.sender;

    const mutuals = await getMutualGuilds(access_token);

    if (!mutuals) {
        res.redirect("/api/auth/login");
        return;
    }

    return mutuals;
});

// Get Guild queue
app.get('/api/guilds/:guild_id/queue', async (req, res) => {
    const { guild_id } = req.params;

    if (!isPlaying(guild_id)) {
        res.status(400).json({ message: "Currently not playing" });
        return;
    }

    /**
     * BESOIN DE CHANGER LE SYSTEME QUE FILE D'ATTENTE
     */
    const queue = getQueue(guild_id);

    res.status(200).json(queue.songs);
    return;
});

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
});



app.listen(5000, () => console.log("API Server listening port : 5000"));

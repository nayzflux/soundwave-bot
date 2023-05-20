import axios from "axios"

const users = new Map();
const guilds = new Map();

interface MyCredentials {
    access_token: string,
    refresh_token: string,
    expires_in: number,
    updated_at: number,
}

export const getCredentials = async (code: string): Promise<MyCredentials> => {
    try {
        const response = await axios.request({
            method: 'post',
            url: `https://discord.com/api/oauth2/token`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: new URLSearchParams({
                client_id: process.env.DISCORD_ID,
                client_secret: process.env.DISCORD_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.CALLBACK_URL,
                scope: 'identify email',
            }).toString()
        });

        const { access_token, refresh_token, expires_in } = response.data;

        return { access_token, refresh_token, expires_in, updated_at: Date.now() };
    } catch (err) {
        console.log(err.response.data);
        return null;
    }
}

export const getCurrentUser = async (access_token: string, userId: string) => {
    if (users.has(userId)) {
        return users.get(userId)
    }

    try {
        const response = await axios.request({
            method: 'get',
            url: `https://discord.com/api/users/@me`,
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        // Mettre en cache pendant 10 minutes
        users.set(userId, response.data);
        setTimeout(() => {
            users.delete(userId)
        }, 10 * 60 * 1000);

        return response.data;
    } catch (err) {
        console.log(err.response.data);
        return null;
    }
}

export const getCurrentUserConnections = async (access_token: string) => {
    /**try {
        const response = await axios.request({
            method: 'get',
            url: `https://discord.com/api/users/@me/connections`,
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return response.data;
    } catch (err) {
        console.log(err.response.data);
        return null;
    }**/
    return null;
}

export const getCurrentGuilds = async (access_token: string, userId: string) => {
    if (guilds.has(userId)) {
        console.log("Guild get from cache")
        return guilds.get(userId)
    }

    try {
        const response = await axios.request({
            method: 'get',
            url: `https://discord.com/api/users/@me/guilds`,
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        // Mettre en cache pendant 30 secondes
        guilds.set(userId, response.data);
        setTimeout(() => {
            guilds.delete(userId)
        }, 60 * 1000);

        return response.data;
    } catch (err) {
        if (err.response.data?.retry_after) {
            console.log(`Rate limit`);
            sleep(Math.ceil(err.response.data?.retry_after) * 1000)
            return getBotGuilds();
        } else {
            console.log(err.response.data);
            return null;
        }
    }
}

export const getBotGuilds = async () => {
    if (guilds.has("bot")) {
        return guilds.get("bot")
    }

    try {
        const response = await axios.request({
            method: 'get',
            url: `https://discord.com/api/users/@me/guilds`,
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
            }
        });

        // Mettre en cache pendant 30 secondes
        guilds.set('bot', response.data);
        setTimeout(() => {
            guilds.delete('bot')
        }, 60 * 1000);

        return response.data;
    } catch (err) {
        if (err.response.data?.retry_after) {
            console.log(`Rate limit`);
            sleep(Math.ceil(err.response.data?.retry_after) * 1000)
            return getBotGuilds();
        } else {
            console.log(err.response.data);
            return null;
        }
    }
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

export const getMutualGuilds = async (access_token: string, userId: string) => {
    const bots = await getBotGuilds();
    const users = await getCurrentGuilds(access_token, userId);

    if (!users) {
        return null;
    }

    const mutuals =  [];

    for (const guild of bots) {
        const isFinded = users.find(g => g.id == guild.id) || false;

        if (isFinded) {
            mutuals.push(guild);
        }
    }

    return mutuals;
}

export const refreshToken = async () => {

}

/**setInterval(() => {
    console.log(users);
    console.log(guilds);
}, 1000)**/
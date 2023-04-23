import axios from "axios"
import { access } from "fs";

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

export const getCurrentUser = async (access_token: string) => {
    try {
        const response = await axios.request({
            method: 'get',
            url: `https://discord.com/api/users/@me`,
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return response.data;
    } catch (err) {
        console.log(err.response.data);
        return null;
    }
}

export const getCurrentGuilds = async (access_token: string) => {
    try {
        const response = await axios.request({
            method: 'get',
            url: `https://discord.com/api/users/@me/guilds`,
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        return response.data;
    } catch (err) {
        console.log(err.response.data);
        return null;
    }
}

export const getBotGuilds = async () => {
    try {
        const response = await axios.request({
            method: 'get',
            url: `https://discord.com/api/users/@me/guilds`,
            headers: {
                'Authorization': `Bot ${process.env.DISCORD_TOKEN}`
            }
        });

        return response.data;
    } catch (err) {
        console.log(err.response.data);
        return null;
    }
}

export const getMutualGuilds = async (access_token: string) => {
    const bots = await getBotGuilds();
    const users = await getCurrentGuilds(access_token);

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
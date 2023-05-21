import {getMutualGuilds} from "../utils/discord";

export const resolveMutualGuilds = async (req, res, next) => {
    const self = req.self;
    //req.discordUser = discordUser;
    const mutuals = await getMutualGuilds(self.credentials.access_token, self.id);
    req.mutuals = mutuals;
    return next();
}
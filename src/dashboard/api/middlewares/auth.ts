import User from "../models/user";
import {getCurrentUser, getCurrentUserConnections, getMutualGuilds} from "../utils/discord";
import {verifyToken} from "../index";

/**
 * Gérer l'authentification
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {} next
 */
export const isAuth = async (req, res, next) => {
    const token = req.cookies?.jwt;

    console.log(token)

    // Si l'utilisateur n'a pas de token
    if (!token) return res.status(401).json({ message: "Authentification requise" });

    // Décoder le token et verifié sa validité
    const decoded = verifyToken(token);
    if (!decoded) return res.status(403).json({ message: "Authentification invalide" });

    // Récupérer l'utilisateur connecter dans la base de donné
    const self = await User.findOne({ id: decoded.id });

    // Vérifier si l'utilisateur n'a pas été supprimer
    if (!self) return res.status(403).json({ message: "L'utilisateur n'existe pas" });

    //const discordUser = await getCurrentUser(self.credentials.access_token, self.id);

    // Stockage des informations d'authentification dans l'objet req pour les fonctions suivantes
    req.self = self;
    //req.discordUser = discordUser;

    console.log(`Authentifié en tant que ${self.username}`);
    return next();
}

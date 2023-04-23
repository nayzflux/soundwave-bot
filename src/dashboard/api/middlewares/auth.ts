import User from "../models/user";

module.exports.isAuth = async (req, res, next) => {
    const session = req.session;

    // si l'utilisateur n'est pas authentifier ou que l'utilisateur n'existe plus
    if (!session.authenticated) return res.status(401).json({ message: "Auth required!" });
    if (!session.user || !session.user._id) return res.status(401).json({ message: "Auth required!" });
    if (!await User.exists({ _id: session.user._id })) return res.status(401).json({ message: "Auth required!" });

    const user = await User.findOne({ _id: session.user._id });

    res.locals.sender = user;

    console.log(`Authentifié en tant que ${user.email}.`);
    return next();
}
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Middleware d'authentification JWT.
 * Vérifie le token envoyé dans le header Authorization et attache l'utilisateur à req.user.
 */
const authMiddleware = (req, res, next) => {
  try {
    // Récupère le header Authorization
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }

    // Le format attendu : "Bearer <token>"
    const tokenParts = authHeader.split(' ');
    if (tokenParts[0] !== 'Bearer' || !tokenParts[1]) {
      return res.status(401).json({ success: false, message: 'Format du token invalide' });
    }

    const token = tokenParts[1];

    // Vérifie et déchiffre le token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Attache les infos de l'utilisateur à la requête
    req.user = {
      userId: decoded.userId,
    };

    // Passe la main au contrôleur
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

module.exports = authMiddleware;

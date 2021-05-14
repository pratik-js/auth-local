const jwt = require('jsonwebtoken');

const accessTokenSecret = process.env.secret || 'poiuy';

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, accessTokenSecret, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.tokenData = user;
            next();
        });
    } else {
        res.sendStatus(401).send();
    }
};
module.exports = { authenticateJWT };
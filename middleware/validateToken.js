const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const { accessToken } = req.cookies;
    const bearerHeader = req.headers["authorization"];

    if (typeof bearerHeader !== 'undefined' || typeof accessToken !== 'undefined') {
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1];

        try {
            const decoded = jwt.verify(accessToken, "tsetrevelc-twj-terces", null);
            jwt.verify(bearerToken, "tsetrevelc-twj-lacol", null);

            req.body._item_author = decoded.uid;
            req.query._item_author = decoded.uid;
            next();
        } catch (error) {
            res.status(401).send({ authFailed: true });
        }
    } else {
        res.sendStatus(403);
    }
}
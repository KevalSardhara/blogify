const { validateToken } = require('../services/authentication.js');

function checkForAuthenticationCookies(tokenName) {
    return (req, res, next) => {
        try {
            console.log("run ----------------------------------------------------");
            const token = req.cookies[tokenName];
            console.log('Cookies: ', token);
            if (!token) {
                return next();
            }
            const userPayload = validateToken(token);
            if (!userPayload) {
                return next();
            }
            req.user = userPayload;
            return next();
        }
        catch (err) {
            return next(new Error('Something went wrong'));
        }
    }
}

module.exports = {
    checkForAuthenticationCookies,
}

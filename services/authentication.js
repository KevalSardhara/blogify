const jwt = require('jsonwebtoken');

const secret = "$#AS%^SD!@";

function createTokenForUser(user) {
    const payload = {
        _id: user._id,
        name: user.name,
        email: user.email
    };

    const token = jwt.sign(payload, secret, {
        expiresIn: 60 * 60 * 24 // expires in 24 hours
    });
    return token;
};

function validateToken(token) {
    const payload = jwt.verify(token, secret);
    return payload;
}

module.exports = {
    createTokenForUser,
    validateToken
};


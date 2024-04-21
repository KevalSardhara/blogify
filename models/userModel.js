const mongoose = require('mongoose');
const { createHmac, randomBytes } = require('node:crypto');
const { createTokenForUser } = require('../services/authentication.js');

// https://stackoverflow.com/questions/14588032/mongoose-password-hashing

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
        required: true,
        default: "abc!@#"
    },
    password: {
        type: String,
        required: true,
    },
    profilePictureURL: { // always put the profile picture in string
        type: String,
        default: "/images/avatar-icon.png",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"], // any different value to be put to be here so mongoose through an error
        default: "USER",
    }
}, { timestamps: true });


// write here normal function for only arrow function denoted as a global variable
userSchema.pre("save", function (next) {
    try {
        const user = this; // 'this' means perticuler user data for here
        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        const salt = randomBytes(16).toString();
        const hashPassword = createHmac('sha256', salt)
            .update(user.password)
            .digest('hex');

        this.salt = salt;
        this.password = hashPassword;

        return next();
        
    } catch (error) {
        return next(error);
    }
});

// virtual function made by self for here
userSchema.static("matchPasswordAndGenerateToken", async function (email, password, req, res) {
    // try {

    const user = await this.findOne({ email });
    // if (!user) throw new Error;
    if (!user) {
        // throw new Error;
        // return res.status(401).json({ message: "Invalid  Email!" });
        throw new Error("User email not found please create account");
    }
    const salt = user.salt;
    const hashPassword = user.password;

    const hashProvidedHash = createHmac('sha256', salt)
        .update(password)
        .digest('hex');

    if (hashProvidedHash !== hashPassword) {
        // throw new Error;
        // return res.status(401).json({ message: "Invalid Password!" });

        throw new Error("Invalid password or email");
    }

    // return { ...user, password: undefined, salt: undefined };
    const token = createTokenForUser(user);
    return token;
    // }
    // catch (err) {
    //     return res.status(401).json({ message: "Invalid  Cradential!" });
    // }

});

const User = mongoose.model("user", userSchema);


// userSchema.pre("save", function() {
//     const user = this;
//     if (!user.isModified("password")) return;
//     user.salt = crypto.randomBytes(16).toString("hex");
//     user.password = crypto
//        .pbkdf2Sync(user.password, user.salt, 1000, 64, "sha512")
//        .toString("hex");
// });

module.exports = {
    User,
};

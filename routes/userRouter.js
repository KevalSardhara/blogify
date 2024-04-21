const express = require('express');
const { User } = require('../models/userModel.js');

const userRouter = express.Router();

userRouter.get("/signin", function (req, res, next) {

    return res.render('signin');
});

userRouter.post("/signin", async function (req, res, next) {
    try {
        const { email, password } = req.body;
        const userToken = await User.matchPasswordAndGenerateToken(email, password, req, res);

        return res.status(200).cookie("token", userToken, {
            expires: new Date(Date.now() + 900000),
            httpOnly: true
        }).redirect("/");

    } catch (error) {
        // return next(error); // or write this
        return res.status(400).render("signin", {
            error: error.message,
        });
    }

});

userRouter.get("/signup", function (req, res, next) {
    return res.render('signup');
});

userRouter.post("/signup", async function (req, res, next) {
    try {
        const { name, email, password } = req.body;
        // in profile picture work in the using multer here
        const user = await User.create({
            name,
            email,
            password
        });
        // or //
        // const userObj = new User({ name, email, password });
        // await userObj.save();

        return res.redirect("/user/signin"); // home page here but redirect from the signin page

    } catch (error) {
        return res.status(400).render("signup", {
            error: "User already exists please use different email address",
        });
    }
});
userRouter.get("/logout", async function (req, res, next) {
    res.clearCookie("token").redirect('/');
});



module.exports = {
    userRouter,
}



// userRouter.post("/signin", function (req, res, next) {
//     const { email, password } = req.body;
//     User.findOne({ email }, function (err, user) {
//         if (err) return next(err);
//         if (!user) return res.redirect("/signin");
//         user.comparePassword(password, function (err, isMatch) {
//             if (err) return next(err);
//             if (isMatch) {
//                 req.session.user = user;
//                 return res.redirect("/");
//             } else {
//                 return res.redirect("/signin");
//             }
//         });
//     });
// });
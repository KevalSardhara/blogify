const dotenv = require("dotenv");

const express = require("express");
const path = require("path");
const logger = require('morgan');
const { connectionMongoodb } = require("./databases/mongodb.js");

const { userRouter } = require('./routes/userRouter.js');
const { blogRouter } = require('./routes/blogRouter.js');

const { Blog } = require('./models/blogModel.js');

const { validateToken } = require('./services/authentication.js');

const { checkForAuthenticationCookies } = require('./middleware/authentication.js');

const cookieParser = require('cookie-parser')

dotenv.config({
    path: "./.env"
})

const app = express();
const PORT = process.env.PORT || 5000;
connectionMongoodb(process.env.MONGODB_CONNECTION).then(() => {
    console.log("Database Connection Successfully");
}).catch(err => {
    console.log(err);
});

// #set
app.set('view engine', 'ejs');
app.set("views", path.join(path.resolve(), "views"));

// #use
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public")));


app.use(checkForAuthenticationCookies("token"));

app.get("/",async (req, res, next) => {

    const allBlogs = await Blog.find({});

    console.log(req.user);
    // if(!req.user) {
    //     return res.status(200).redirect("/user/signin");
    // }
    return res.render("home", {
        user: req.user,
        blog : allBlogs,
    });
});

app.use("/user", userRouter);
app.use("/blog", blogRouter);


app.use((err, req, res, next) => {
    res.status(404).json({
        status : false,
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

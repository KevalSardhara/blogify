const dotenv = require("dotenv");
// require("./aws-s3-bucket.js");

const express = require("express");

const http = require("http");

const { Server } = require("socket.io");
const io = new Server();

const path = require("path");
const logger = require('morgan');
const { connectionMongoodb } = require("./databases/mongodb.js");

const { userRouter } = require('./routes/userRouter.js');
const { blogRouter } = require('./routes/blogRouter.js');

const { Blog } = require('./models/blogModel.js');

const { validateToken } = require('./services/authentication.js');

const { checkForAuthenticationCookies } = require('./middleware/authentication.js');

const cookieParser = require('cookie-parser');
const { User } = require("./models/userModel.js");

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


const httpServer = http.createServer(app);
io.attach(httpServer);
// app.use(checkForAuthenticationCookies("token")); // only socket testing time we will comment this line


// henddle socket io functinality here

const usp = io.of('/user-namesapce');

// usp.on("connection", function(socket) {});
usp.on("connection", async function(socket) {
    console.log("new user connected", socket);

    // socket.on("varify", function(socketObj) {
    //      console.log(socketObj.id , socket.id);
    // });

    const userId = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication failed: No token provided'));
    }

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return next(new Error('Authentication failed: Invalid token'));
        }
        // Add decoded user information to the socket object
        socket.user = decoded.user;
        next();
    });

    
    // check 
    const userOnline = await User.findByIdAndUpdate({_id : userId}, {$set : {"is_online" : "1"}});
    socket.broadcast.emit("getOnlineUser", {user_id : userId});

    socket.on("resMessage", function(msg) {
        io.emit("reqMessage", msg);
    });
    
    socket.on("disconnect", async function() {
        console.log("socket disconnected");
        const userId = socket.handshake.auth.token;
        const userOfline = await User.findByIdAndUpdate({_id : userId}, {$set : {"is_online" : "0"}});
        socket.broadcast.emit("getOflineUser", {user_id : userId});
    });

});

app.get("/chat", (req, res) => {
    res.sendFile(path.join(path.resolve(), "views/socket-chat.html"));
});


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

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

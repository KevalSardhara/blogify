const express = require('express');
const { Blog } = require('../models/blogModel.js');
const { Comment } = require('../models/commentModel.js');

const multer = require('multer');
const path = require("path");

const blogRouter = express.Router();


// write the code in the utils folder
const { v2: cloudinary } = require('cloudinary');
const { fstat } = require('fs');

cloudinary.config({
    cloud_name: 'kevalsardhara',
    api_key: '916462212994434',
    api_secret: 'T8FWQBO8A9fGygJtfz8r4Q5kG78'
});


const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("try again");
        }
        const responce = await cloudinary.uploader.upload(localFilePath,
            { 
                // public_id: "olympic_flag",
                resource_type : 'auto'
            },
            function (error, result) {
                if (error) {
                    return res.status(400).json({
                        status: false,
                        message: error.message
                    });
                    // throw new Error("try again");
                }
                console.log(responce);
            });
        return responce;

    } catch (error) {
        // return next(error);
        
        fs.unlinkSync(localFilePath);
        return res.status(400).json({
            status: false,
            message: error.message
        });
    }
}

// add the cloudenery with multer for the file upload
// another option like the express-fileupload/multer

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(path.resolve(), './public/uploads/'));
    },
    filename: function (req, file, cb) {
        const fileName = Date.now() + '-' + file.originalname;
        cb(null, fileName);
    }
})
const upload = multer({ storage: storage });


blogRouter.get("/add-new", function (req, res, next) {
    return res.render('addBlog', {
        user: req.user,
    });
});




blogRouter.post("/", upload.single('coverImageURL'), async function (req, res, next) {
    console.log(req.body);
    console.log(req.file);
    const { title, body } = req.body;
    const blog = await Blog.create({
        title,
        body,
        createdBy: req.user._id,
        coverImageURL: `./uploads/${(req.file.filename)}`,
    });
    return res.redirect(`/blog/${blog._id}`);
});

blogRouter.get("/:id", async function (req, res, next) {
    const blog = await Blog.findById({ _id: req.params.id }).populate('createdBy');
    const comment = await Comment.find({ blogId: req.params.id }).populate('createdBy');

    console.log(blog);
    res.render('blog', {
        user: req.user,
        blog,
        comment,
    });
});

blogRouter.post("/comment/:blogId", async function (req, res, next) {
    const comment = await Comment.create({
        comment: req.body.comment,
        blogId: req.params.blogId,
        createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
});


module.exports = {
    blogRouter,
}

var multer  = require('multer');
// const fs = require("fs");
// const { promisify } = require("util");
// const unlinkAsync = promisify(fs.unlink);
const config = require("config");


module.exports.uploadBusimages = async (req,res,next) =>{
    var upload = multer({
        dest: 'uploads/',
        // limits: { fileSize: config.get("image-max-size") },
        fileFilter: (req, file, cb) => {
            checkFileType(file, cb);
        }
    }).fields(
        [
            {
                name:'front_side', maxCount:1
            },
            {
                name:'left_side', maxCount:1
            },
            {
                name:'right_side', maxCount:1
            },
            {
                name:'back_side', maxCount:1
            },
            {
                name:'driver_cabin', maxCount:1
            },
            {
                name:'entire_inside', maxCount:1
            }
        ]
    );
    upload(req, res, function(err) {
        if(err) {
            res.send({
                status :false,
                error : err.message
            })
        }
        req.data = req.body
        console.log("Data ",req.data);
        next()
    })
}


function checkFileType(file, cb) {
    if (
        file.mimetype === 'image/png'||file.mimetype === 'image/jpeg'
        ) { // check file type to be png, jpeg, or jpg
        console.log("File type matched")
        cb(null, true);
    } else {
        console.log("file type didn't  matched")
        cb(null, false); // else fails
    }
}
const bcrypt = require('bcrypt');
const config = require('config');
var ImageKit = require("imagekit");
const jwt = require('jsonwebtoken');

module.exports.encryptPassword = async (saltRounds,plainPassword) =>{
    return new Promise((resolve,reject) =>{
        try{
            bcrypt.hash(plainPassword,saltRounds).then(function(hash){
                resolve(hash)
            }).catch(error =>{
                reject(error)
            })
        }catch(error){
            reject(error)
        }
    })
}

module.exports.checkPassword = async (plainPassword,hash) =>{
    return new Promise((resolve,reject) =>{
        try{
            bcrypt.compare(plainPassword,hash).then(function(res){
                resolve(res)
            })
        }catch(error){
            reject(error)
        }
    })
}

module.exports.uploadImageToImagekit = async (fileContent,file_key)=>{
    console.log("file_key : ", file_key)
        try {
            var imagekit = new ImageKit({
                publicKey : config.get("imagekit.storage.publicKey"),
                privateKey : config.get("imagekit.storage.privateKey"),
                urlEndpoint : config.get("imagekit.storage.urlEndpoint")
            });
            console.log("imagekit ",imagekit);
            console.log("fileContent ",fileContent);
            const imageURL = await imagekit.upload({file: fileContent, fileName:file_key})
            // var imageURL = imagekit.url({
            //     path : fileContent,
            //     urlEndpoint : config.get("imagekit.storage.urlEndpoint"),
            //     queryParameters : file_key,
            //     transformation : [{
            //         "height" : "300",
            //         "width" : "400"
            //     }]
            // });
            return imageURL.url;
        } catch (error) {
            return (error)
        }
}

module.exports.decodeToken = async (token) =>{
    return new Promise((resolve,reject) =>{
        jwt.verify(token, config.get("partnertokenSecret"), function(err, decoded) {
            console.log("decoded ",decoded);
            console.log("decoded.partnerInfo ",decoded.partnerInfo) // bar
            resolve(decoded.partnerInfo);
        });
    })
}
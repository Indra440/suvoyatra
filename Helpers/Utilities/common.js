const bcrypt = require('bcrypt');
const config = require('config');
var ImageKit = require("imagekit");
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const fast2sms = require('fast-two-sms');
var moment = require("moment");

module.exports.validatePhonenumber = (phno)=> {
    var phoneno = /^\(?([6-9]{1})\)?[]?([0-9]{8})[]?([0-9]{1})$/;
    if(phno.match(phoneno) && (phno.length == 10)) {
        return true;
    }
    else {
        return false;
    }
}

module.exports.validateEmail = (email)=> {
    emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(emailRegexp.test(email)) {
        return true;
    }
    else {
        return false;
    }
}

module.exports.calulateTime = (startDate,endDate) =>{
    const format1 = "YYYY-MM-DD HH:mm:ss"
    startDate = startDate.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    console.log("STart date ",new Date(startDate));
    startDate = new Date(startDate);
    endDate = Date.parse(endDate);
    endDate = endDate - ((5 * 3600 * 1000)+(30 * 60 * 1000));
    endDate = new Date(endDate);
    var start_date = moment(startDate, format1);
    var end_date = moment(endDate, format1);
    // var duration = moment.duration(end_date.diff(start_date));
    var minuteDiff = end_date.diff(start_date, 'minutes');
    console.log("start_date ",start_date);
    console.log("end_date ",end_date);
    console.log("minuteDiff ",minuteDiff);
    return minuteDiff;
}

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
        jwt.verify(token, config.get("LogintokenSecret"), function(err, decoded) {
            console.log("decoded ",decoded);
            console.log("decoded.partnerInfo ",decoded.partnerInfo) // bar
            resolve(decoded.partnerInfo);
        });
    })
}

module.exports.sendMail = async(mailDetails) =>{
    try{
        console.log("mailDetails ",mailDetails);
        let transporter = nodemailer.createTransport({
            service:'gmail',
            // host: "smtp.ethereal.email",
            // port: 587,
            // secure: false, // true for 465, false for other ports
            auth: {
              user: config.get("EMAILUSER"), // generated ethereal user
              pass: config.get("EMAILPASSWORD"), // generated ethereal password
            },
          });
          console.log("transporter ",transporter);
        // send mail with defined transport object
        let mailOptions = {
            from: process.env.EMAILUSER, // sender address
            to: mailDetails.to, // list of receivers
            subject: mailDetails.subject, // Subject line
            // text: "Hello world?", // plain text body
            html: mailDetails.message, // html body
        }
        let info = await transporter.sendMail(mailOptions);
        console.log("info ",info);
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        return true;
    }catch(err){
        return err;
    }
}

module.exports.sendSms = async(smsDetails) =>{
    try{
        var options = {authorization : config.get("SMS_API_KEY"), message : smsDetails.message ,  numbers : [smsDetails.to]}
        console.log("Options ",options); 
        const response = await fast2sms.sendMessage(options)
        console.log(response)
        return true;
    }catch(err){
        return err;
    }
}


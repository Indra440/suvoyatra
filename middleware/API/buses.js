
var multer  = require('multer');
// const fs = require("fs");
// const { promisify } = require("util");
// const unlinkAsync = promisify(fs.unlink);
const config = require("config");
const busModel = require("../../models/buses");
const mongoose = require("mongoose");
const _helper = require('../../Helpers/helpers');

module.exports.uploadBusimages = async (req,res,next) =>{
    var upload = multer({
        dest: 'uploads/',
        limits: { fileSize: config.get("imagekit.image-max-size") },
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
            res.status(500).send({
                status :false,
                error : err.message
            })
        }
        req.data = req.body
        console.log("Data ",req.data);
        next()
    })
}

module.exports.addBus = async(req,res,next) =>{
    try{
        const {busName,busnumber,journeyForm,journeyTo,departureTime,
            arrivalTime,viaRoot,noOfSeat,busType,acType,multimediaType,busDescription} = req.body;
        if(!busName || busName == "" || busName == undefined||
            !busnumber || busnumber == "" || busnumber == undefined ||
            !journeyForm || journeyForm == "" || journeyForm == undefined ||
            !journeyTo || journeyTo == "" || journeyTo == undefined ||
            !departureTime || departureTime == "" || departureTime == undefined||
            !arrivalTime || arrivalTime == "" || arrivalTime == undefined||
            !noOfSeat || isNaN(noOfSeat) || noOfSeat == undefined  ||
            !busType || busType == "" || busType == undefined ||
            !acType || acType== "" || acType == undefined||
            !multimediaType || multimediaType == "" || multimediaType == undefined||
            !busDescription || busDescription == "" || busDescription == undefined){
                await _helper.utility.buses.remove_all_images_for_buses(req.files);
                res.status(500).send({status:false,message:"Please fill all the fields with valid details"});
            }

            if(!req.files.front_side || !req.files.left_side ||
                !req.files.right_side || !req.files.back_side ||
                !req.files.driver_cabin || !req.files.driver_cabin){
                    await _helper.utility.buses.remove_all_images_for_buses(req.files);
                    res.status(500).send({status:false,message:"Please send all the images properly"});
                }
            
            if(Number(departureTime.split(":")[0]) < 0 || Number(departureTime.split(":")[0]) > 23 ||
                Number(departureTime.split(":")[1]) < 0 || Number(departureTime.split(":")[1]) > 59 ||
                 isNaN(Number(departureTime.split(":")[0]))){
                res.status(500).send({status:false,message:"Please selct a valid departure time"});
            }
            if(Number(arrivalTime.split(":")[0]) < 0 || Number(arrivalTime.split(":")[0]) > 23 || 
                Number(arrivalTime.split(":")[1]) < 0 || Number(arrivalTime.split(":")[1]) > 59 ||
                isNaN(Number(arrivalTime.split(":")[0]))){
                res.status(500).send({status:false,message:"Please selct a valid arrivalTime time"});
            }
            
            const fetchBusDetails = await busModel.findOne({busNumber:String(busnumber),is_active:true});
            console.log("fetchBusDetails ",fetchBusDetails);
            if(fetchBusDetails && fetchBusDetails != null){
                await _helper.utility.buses.remove_all_images_for_buses(req.files);
                res.status(500).send({status:false,message:"This Bus Number is already exist"});
            }
            next();
    }catch(err){
        console.log("Error!!!",err);
        await _helper.utility.buses.remove_all_images_for_buses(req.files);
        res.status(500).send({status:false,message:"Error occur while fetching the bus details"});
    }

}

module.exports.fetchseatTemplateFoBus = async (req,res,next)=>{
    const bus_id = req.body.busId;
    if(!bus_id || bus_id == null || bus_id == "" || bus_id == undefined){
        res.status(500).send({status:false,message:"Please send a valid parameter"})
    }
    next();
}

module.exports.updateseatTemplate = async(req,res,next) =>{
    try{
            const {busId,updateTemplate} = req.body;
        if(!busId || busId == "" || busId == null || busId == undefined ||
            !updateTemplate || updateTemplate == "" || updateTemplate == null || updateTemplate == undefined
            ){
                res.status(500).send({status:false,message:"Please select all required fields"})
            }
        if(updateTemplate != "Template1" && updateTemplate != "Template2"){
            res.status(500).send({status:false,message:"Please select a valid template"})
        }
        const fetchBusdetails = await busModel.findOne({_id:mongoose.Types.ObjectId(busId),is_active:true})
        if(!fetchBusdetails){
            res.status(500).send({status:false,message:"bus not found or bus is Inactive"})
        }
        req.busDetails = fetchBusdetails;
        next();
    }catch(e){
        console.log("UpdateSeatTemplate Error :::",e);
        res.status(500).send({status:false,message:"Error occur while fetching the bus details"});
    }
}

module.exports.addUserToBus = async (req,res,next) =>{
    try{
        const{busId,name,mobileNo,scenario} = req.body;
        if(!busId || busId == "" || busId == null || busId == undefined ||
            !name || name == "" || name == null || name == undefined ||
            !mobileNo || mobileNo == "" || mobileNo == null || mobileNo == undefined || 
            !scenario || scenario == "" || scenario == null || scenario == undefined
        ){
            return res.status(500).send({status:false,message:"Please fill all the require fields"});
        }
        if(scenario != "driver" && scenario != "conductor"){
            return res.status(500).send({status:false,message:"You can add only driver and conductor as user"});
        }
        if(mobileNo.length !=10){
            return res.status(500).send({status:false,message:"Please enter a valid Mobile no"});
        }
        const fetchBusDetails = await busModel.findOne({_id:mongoose.Types.ObjectId(busId),is_active:true});
        if(!fetchBusDetails){
            return res.status(500).send({status:false,message:"Bus not found"});
        }
        let users = (scenario == "driver") ? fetchBusDetails.drivers : (scenario == "conductor") ? fetchBusDetails.conductors : [];
        if(users.length > 0){
            for(i=0; i< users.length;i++){
                const cur_user = users[i];
                if((String(cur_user.mobile) == String(mobileNo))  && (cur_user.is_active == true)){
                    return res.status(500).send({status:false,message:"This user is already added as "+scenario});
                }
            }                
        }
        req.busDetails =  fetchBusDetails;
        next();
    }catch(err){
        console.log("UpdateSeatTemplate Error :::",err);
        res.status(500).send({status:false,message:"Error occur while adding user"});
    }
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
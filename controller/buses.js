
const fs = require('fs');
const _helper = require('../Helpers/helpers');
const busModel = require('../models/buses');
const mongoose = require('mongoose');
const queryModel = require('../models/queries');

const addBus = async (user,busDetails,files,existBusDetails) =>{
    let response = {
        status:false,
        message : "",
    }    
    try{
        console.log("busDetails ",busDetails);
        const {busName,busnumber,journeyForm,journeyTo,departureTime,
                                arrivalTime,viaRoot,noOfSeat,busType,acType,multimediaType,busDescription} = busDetails;
        const bus_id = busDetails.bus_id;

        const noSpaceName = busName.replace(/\s/g, "_");
        const partner_id = user._id;

        if(files.front_side_fileContent != "" ){
            const front_side_fileContents = files.front_side_fileContent;
            let front_side_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-front_side.png`;
            var front_side_image_link = await _helper.utility.common.uploadImageToImagekit(front_side_fileContents,front_side_key)
            if(!front_side_image_link){
                response.message = "Error occur while uploading files"
                return response;
            }
        }
        if(files.left_side_fileContent != "" ){
            const left_side_fileContents = files.left_side_fileContent;
            let left_side_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-left_side.png`;
            var left_side_image_link = await _helper.utility.common.uploadImageToImagekit(left_side_fileContents,left_side_key)
            if(!left_side_image_link){
                response.message = "Error occur while uploading files"
                return response;
            }
        }

        if(files.right_side_fileContent != "" ){
            const right_side_fileContents = files.right_side_fileContent;
            let right_side_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-right_side.png`;
            var right_side_image_link = await _helper.utility.common.uploadImageToImagekit(right_side_fileContents,right_side_key)
            if(!right_side_image_link){
                response.message = "Error occur while uploading files"
                return response;
            }
        }
        if(files.back_side_fileContent != "" ){
            const back_side_fileContents = files.back_side_fileContent;
            let back_side_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-back_side.png`;
            var back_side_image_link = await _helper.utility.common.uploadImageToImagekit(back_side_fileContents,back_side_key)
            if(!back_side_image_link){
                response.message = "Error occur while uploading files"
                return response;
            }
        }
        if(files.driver_cabin_fileContent != "" ){
            const driver_cabin_fileContent = files.driver_cabin_fileContent;
            let driver_cabin_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-driver_cabin.png`;
            var driver_cabin_image_link = await _helper.utility.common.uploadImageToImagekit(driver_cabin_fileContent,driver_cabin_key)
            if(!driver_cabin_image_link){
                response.message = "Error occur while uploading files"
                return response;
            }
        }
        if(files.entire_inside_fileContent != "" ){
            const entire_inside_fileContent = files.entire_inside_fileContent;
            let entire_inside_key = `busimages/${partner_id}-${noSpaceName}-${busnumber}-entire_inside.png`;
            var entire_inside_image_link = await _helper.utility.common.uploadImageToImagekit(entire_inside_fileContent,entire_inside_key)
            if(!entire_inside_image_link){
                response.message = "Error occur while uploading files"
                return response;
            }
        }
        if(!bus_id || bus_id == null || bus_id == undefined || bus_id == ""){
            const payload = {
                partnerId: mongoose.Types.ObjectId(partner_id),
                busName : busName,
                busNumber : busnumber,
                busRoadMap:{
                    journeyForm : journeyForm,
                    journeyTo : journeyTo,
                    viaRoot : JSON.parse(viaRoot)
                },
                busTiming :{
                    departureTime : departureTime.includes("PM") || departureTime.includes("PM") ? _helper.utility.buses.convertTime12to24(departureTime) : departureTime,
                    arrivalTime : arrivalTime.includes("PM") || arrivalTime.includes("AM") ? _helper.utility.buses.convertTime12to24(arrivalTime) : arrivalTime,
                },
                busFeature : {
                    noOfSeat : Number(noOfSeat),
                    busType : busType,
                    acType : acType,
                    multimediaType : multimediaType
                },
                busDescription:busDescription,
                busImages:{
                    front_side : front_side_image_link,
                    left_side : left_side_image_link,
                    right_side : right_side_image_link,
                    back_side : back_side_image_link,
                    driver_cabin : driver_cabin_image_link,
                    entire_inside : entire_inside_image_link
                }
            }
    
            let model = new busModel(payload);
            console.log("payload ",payload);
            const addBus = await model.save();
                if(!addBus){
                    response.message = "Error occur while adding buses"
                    return response;
                }
                console.log("addBus ",addBus);
                response.status = true;
                response.message = "Bus added successfully";
                console.log("Response is here ",response);
                return response;
        }else{
            if(existBusDetails == ""){
                response.status = false;
                response.message = "Something went wrong while updating Bus";
                return response;
            }
            // let existbusdetails = existBusDetails;
            existBusDetails.busName = busName;

            existBusDetails.busRoadMap.journeyForm = journeyForm;
            existBusDetails.busRoadMap.journeyTo = journeyTo;
            existBusDetails.busRoadMap.viaRoot = JSON.parse(viaRoot);

            existBusDetails.busTiming.departureTime = departureTime.includes("PM") || departureTime.includes("PM") ? _helper.utility.buses.convertTime12to24(departureTime) : departureTime;
            existBusDetails.busTiming.arrivalTime = arrivalTime.includes("PM") || arrivalTime.includes("AM") ? _helper.utility.buses.convertTime12to24(arrivalTime) : arrivalTime;

            existBusDetails.busFeature.noOfSeat =  Number(noOfSeat);
            existBusDetails.busFeature.busType =  busType;
            existBusDetails.busFeature.acType =  acType;
            existBusDetails.busFeature.multimediaType = multimediaType
            
            existBusDetails.busDescription = busDescription;

            existBusDetails.busImages.front_side = (files.front_side_fileContent != "") ? front_side_image_link : existBusDetails.busImages.front_side;
            existBusDetails.busImages.left_side = (files.left_side_fileContent != "") ? left_side_image_link : existBusDetails.busImages.left_side;
            existBusDetails.busImages.right_side = (files.right_side_fileContent != "") ? right_side_image_link : existBusDetails.busImages.right_side;
            existBusDetails.busImages.back_side = (files.back_side_fileContent != "") ? back_side_image_link : existBusDetails.busImages.back_side;
            existBusDetails.busImages.driver_cabin = (files.driver_cabin_fileContent != "") ? driver_cabin_image_link : existBusDetails.busImages.driver_cabin;
            existBusDetails.busImages.entire_inside = (files.entire_inside_fileContent != "") ? entire_inside_image_link : existBusDetails.busImages.entire_inside;
            
            await existBusDetails.save();
            response.status = true;
            response.message = "Bus updated successfully";
            return response;
        }
    }catch(err){
        response.message = "Error occured while creating bus";
        response.payload = err;
        return response;
    }
}

const getBuslist = async (user,page) =>{
    let response = {
        status:false,
        message : "",
    }    
    try{
        const pertnerId = user._id;
        const limit = 1;
        console.log("Partner id",pertnerId);
        let busListQuery = [
            {
                $match:{
                     partnerId:mongoose.Types.ObjectId(pertnerId),
                     is_active : true
                }
             },
             {
                 $project:{
                     _id:1,
                     busName :1,
                     busTiming :1,
                     busFeature :1,
                     busImages :1,
                     busDescription :1,
                     busRoadMap : 1
                 }
             }
        ];
        var totalBusList  = (await busModel.aggregate(busListQuery)).length
        console.log("TotalBusList ",totalBusList);
        if(page && page != null && page !="" && page !=undefined){
            busListQuery = [...busListQuery,{ $skip: (page-1) * limit},{ $limit: limit }]
        }
        console.log("Page is ",page);
        console.log("busListQuery ",busListQuery);
        var busList = await busModel.aggregate(busListQuery);
        
        if(!busList){
            response.message = "Error occured while getting bus list"
            return response;
        }
        response.status = true;
        response.message = "Buslist fetch successfully";
        response.payload = busList;
        response.totalPages = Number(totalBusList/limit);
        response.currentPage = Number(page);
        return response;
    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

const getSeatTemplate = async(busId) =>{
    let response = {
        status:false,
        message : "",
    }    
    try{
        const getSeatTemplate = await busModel.findOne({_id:mongoose.Types.ObjectId(busId),is_active:true});
        if(!getSeatTemplate){
            response.message = "Bus not found"
            return response;
        }
        console.log("getSeatTemplate.seatTemplate",getSeatTemplate.seatTemplate);
        if(!getSeatTemplate.seatTemplate || getSeatTemplate.seatTemplate == null || getSeatTemplate.seatTemplate == undefined){
            response.status = false;
            response.message = "No seat Template has set for this bus !!! Please choose one seat template.";
            return response;
        }
            response.status = true;
            response.message = "Bus template fetched successfully";
            response.payload = {
                "template":getSeatTemplate.seatTemplate
            };
            return response;
    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

const updateSeatTemplate= async(busdetails,updateTemplate) =>{
    let response = {
        status:false,
        message : "",
    }    
    try{
        console.log("busdetails here ",busdetails);
        busdetails.seatTemplate = updateTemplate;
        let upadateTemplate = await busdetails.save();
        if(!upadateTemplate){
            response.status = false;
            response.message = "Error occur while updating seat template. Please try again after some time";
            return response;
        }
        response.status = true;
        response.message = "Seat template updated successfully";
        response.payload = {
            "template":busdetails.seatTemplate
        };
        return response;
    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

const fetchBusDetails= async(busId) =>{
    let response = {
        status:false,
        message : "",
    }    
    try{
        let fetchBusDetails = await busModel.aggregate([
            {
                $match:{
                    _id:mongoose.Types.ObjectId(String(busId)),
                    is_active:true
                }
            },
            {
                $project:{
                    _id:1,
                    busName : 1,
                    busNumber : 1,
                    busRoadMap : 1,
                    busTiming :1,
                    busFeature : 1,
                    busImages : 1,
                    busDescription :1
                }
            }
        ])
        if(!fetchBusDetails || fetchBusDetails == null || fetchBusDetails == undefined || 
                !fetchBusDetails[0] || fetchBusDetails[0] == null || fetchBusDetails[0] == undefined ){
                    response.status = false;
                    response.message = "Bus not found or deactivated";
                    return response;
                }
        response.status = true;
        response.message = "Bus details fetched successfully";
        response.payload = fetchBusDetails[0];
        return response;
    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

const sendQuery = async(queryDetails,is_partner,partnerDetails)=>{
    let response = {
        status:false,
        message : "",
    }
    try{
        var {name,phone,email,subject,message} = queryDetails;
        const payload = {
            name : (name && name !="") ? name : "",
            mobile : is_partner == true ? partnerDetails.ph_no : phone,
            email : is_partner == true ? partnerDetails.email : email,
            subject : subject,
            message :message,
            isPartner : is_partner
        }
        let model = new queryModel(payload);
        let saveQuery = await model.save();
        if(!saveQuery){
            response.message = "Error occur while adding buses"
            return response;
        }
        response.status = true;
        response.message = "Query saved successfully";
        return response;

    }catch(err){
        response.message = "Error occured while getting bus list";
        response.payload = err;
        return response;
    }
}

const addUserToBus = async(busDetails,userDetails) =>{
    let response = {
        status:false,
        message : "",
    }
    try{
        console.log("Bus details ",busDetails);
        const{busId,name,mobileNo,scenario} = userDetails;
        let payload = {
            name : name,
            mobile : mobileNo,
        }
        console.log("Payload ",payload);
        scenario == "driver" ? busDetails.drivers.push(payload) : scenario == "conductor" ? busDetails.conductors.push(payload) :"";
        console.log("After changing bus details ",busDetails);
        await busDetails.save();
        let MsgDetails = {
            to:mobileNo,
            message : "Hey " + name + ",hope you are doing well. We are glad to inform you that you are added as "+ scenario + " in "+ busDetails.busName +" bus"   
        }
        const sendSMS = await _helper.utility.common.sendSms(MsgDetails);
        if(sendSMS != true){
            response.message = "User added but not able to send sms to that user."
            return response;
        }
        response.status = true;
        response.message = scenario + " added successfully";
        return response;
    }catch(err){
        console.log("Error!!!! ",err);
        response.message = "Error occured while adding user";
        response.payload = err;
        return response;
    }
}

const fetchUsersListForPartner = async (user) =>{
    let response = {
        status:false,
        message : "",
    }
    try{
        let fetchUserList = await busModel.aggregate([
            {
                $match:{
                    partnerId:mongoose.Types.ObjectId(user._id),
                    is_active : true
                }
            },
            {
                $project:{
                    _id:1,
                    busName : 1,
                    drivers : 1,
                    conductors : 1
                }
            }
        ])
        if(!fetchUserList){
            response.message = "Error occur while fetching user list ! PLease try again after some time";
            return response;
        }
        response.status = true;
        response.message = "User list fetch successfully";
        response.payload = fetchUserList;
        return response;
    }catch(err){
        console.log("Error!!!! ",err);
        response.message = "Error occured while adding user";
        response.payload = err;
        return response;
    }

}

const findAtransfer = async (page,queryDetails) =>{
    let response = {
        status:false,
        message : "",
        payload : []
    }
    console.log("Its hitting here ",page,queryDetails);
    try{
        const cur_page = page ? page : 1;
        const limit = 1;
        let searchJson = {};
        var searchQUery = [
            {
                $match:{
                    is_active:true
                }
            },
            {
                $lookup:{
                    from: "bookings",
                    localField: "_id",
                    foreignField: "busId",
                    as: "bookingDetails"
                }
            },
            {
                $unwind:{
                    path:"$bookingDetails",
                    preserveNullAndEmptyArrays: true
                } 
            },
            {
                $project:{
                            _id:1,
                            busName : 1,
                            busRoadMap : 1,
                            busTiming :1,
                            busFeature :1,
                            busImages : 1,
                            busDescription : 1,
                            bookingDetails : 1,
                            bookingDates : {$cond:{ if: { $eq: [ "$bookingDetails", null ] }, then: null, else:
                                {"bookingDateYear" : { $year: "$bookingDetails.bookingFor" },
                                "bookingDateMonth": { $month: "$bookingDetails.bookingFor" },
                                "bookingDateDay": { $dayOfMonth: "$bookingDetails.bookingFor" }}
                                 }},
                        } 
            },
            {
                $project:{
                            _id:1,
                            busName : 1,
                            busRoadMap : 1,
                            busTiming :1,
                            busFeature :1,
                            busImages : 1,
                            busDescription : 1,
                            bookingDetails : {$cond:{ if: {
                                $and:[
                                    { $ne: [ "$bookingDetails", null ] },
                                    { $eq:["$bookingDates.bookingDateYear" , Number(String(queryDetails.departureDate).split("-")[0])]},
                                    { $eq:["$bookingDates.bookingDateMonth" , Number(String(queryDetails.departureDate).split("-")[1])]},
                                    { $eq:["$bookingDates.bookingDateDay" , Number(String(queryDetails.departureDate).split("-")[2])]},
                                    { $eq:["$bookingDetails.bookingStatus","confirmed"]}
                                ]}, then: "$bookingDetails", else:null}
                            }
                        } 
            },
            {
                $unwind:{
                    path:"$busRoadMap.viaRoot",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
               $match:{
                        $and:[
                        {$or:[{"busRoadMap.journeyForm":queryDetails.pickupLocation},{"busRoadMap.journeyTo":queryDetails.pickupLocation},{"busRoadMap.viaRoot.rootName":queryDetails.pickupLocation}]},
                        {$or:[{"busRoadMap.journeyForm":queryDetails.dropLocation},{"busRoadMap.journeyTo":queryDetails.dropLocation},{"busRoadMap.viaRoot.rootName":queryDetails.dropLocation}]}
                    ]
                   }
            },
            {
                $group:{
                    _id:"$_id",
                    busName:{
                        $first:"$busName"
                    },
                    journeyForm:{
                            $first:"$busRoadMap.journeyForm"
                    },
                    journeyTo:{
                        $first:"$busRoadMap.journeyTo"
                    },
                    journeyFare :{
                        $first:"$busRoadMap.journeyFare"
                    },
                    viaRoot:{
                        $addToSet:"$busRoadMap.viaRoot"
                    },
                    busTiming:{
                        $first:"$busTiming"
                    },
                    busFeature:{
                        $first:"$busFeature"
                    },
                    busImages:{
                        $first:"$busImages"
                    },
                    busDescription :{
                        $first:"$busDescription"
                    },
                    bookingDetails :{
                            $addToSet : "$bookingDetails"
                    }
                }
            },
            {
                $unwind:{
                        path:"$bookingDetails",
                        preserveNullAndEmptyArrays: true
                    }
            },
            {
                $group:{
                    _id:"$_id",
                    busName:{
                        $first:"$busName"
                    },
                    journeyForm:{
                            $first:"$journeyForm"
                    },
                    journeyTo:{
                        $first:"$journeyTo"
                    },
                    journeyFare :{
                        $first:"$journeyFare"
                    },
                    viaRoot:{
                        $addToSet:"$viaRoot"
                    },
                    busTiming:{
                        $first:"$busTiming"
                    },
                    busFeature:{
                        $first:"$busFeature"
                    },
                    busImages:{
                        $first:"$busImages"
                    },
                    busDescription :{
                        $first:"$busDescription"
                    },
                    totalSeatBooked : {
                        $sum:{$cond:[{$ifNull: ["$bookingDetails",false]},{"$size":"$bookingDetails.bookingSeat"},0]}
                    }
                }
            }            
        ];
        console.log("Whole search query",JSON.stringify(searchQUery));
        // searchQUery.push(searchJson);
        if(queryDetails.departureTime && queryDetails.departureTime !=""){
            searchQUery = [...searchQUery,{$match:{"busTiming.departureTime":queryDetails.departureTime}}];
        }
        if(queryDetails.acType != "" && queryDetails.acType == "Ac"){
            searchQUery = [...searchQUery,{$match:{"busFeature.acType":queryDetails.acType}}];
        }
        var totalBusList  = (await busModel.aggregate(searchQUery)).length
        console.log("TotalBusList ",totalBusList);
        if(cur_page && cur_page != null && cur_page !="" && cur_page !=undefined){
            searchQUery = [...searchQUery,{ $skip: (cur_page-1) * limit},{ $limit: limit }]
        }
        const finalBusList = await busModel.aggregate(searchQUery);
        if(!finalBusList){
            response.message = "Error occur while fetching Bus list";
            return response;
        }
        console.log("finalBusList ",finalBusList);
        response.status = true;
        response.message = "User list fetch successfully";
        response.payload = finalBusList;
        response.pages = totalBusList/limit;
        response.currentPage = cur_page;
        console.log("response ",response);
        return response;

    }catch(err){
        response.message = "Error occured while adding user";
        response.payload = err;
        return response;
    }
}

module.exports = {
    addBus,
    getBuslist,
    getSeatTemplate,
    updateSeatTemplate,
    fetchBusDetails,
    sendQuery,
    addUserToBus,
    fetchUsersListForPartner,
    findAtransfer
}
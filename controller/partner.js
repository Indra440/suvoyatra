
const usersModel = require('../models/users');
const _helper = require('../Helpers/helpers');


const addPartner = async (partnerDetails) =>{
    let response = {
        status:false,
        message : ""
    }
    const hash = await _helper.utility.common.encryptPassword(10,partnerDetails.password)
    // return new Promise((resolve,reject)=>{
        try{
            let obj = {
                name : partnerDetails.name,
                ph_no : partnerDetails.phone,
                email : partnerDetails.email,
                password : hash
            }
            console.log("obj ",obj);
            let model = new usersModel(obj);
            let svaedPartner = await model.save();
                if(!svaedPartner){
                    response.message = "Error while adding partner";
                    reject(response);
                }
                console.log("svaedPartner ",svaedPartner);
                response.status = true;
                response.message = "Partner added successfully";
                return(response);
            // })
        }catch(error){
            response.message = error.message;
            return(response);
        }
    // })
}

const partnerLogin = async (partnerCredentials) =>{
    let response = {
        status:false,
        message : "",
        payload:{}
    }
    try{
        console.log("partnerCredentials ",partnerCredentials);
        let findPartner = await usersModel.findOne({$or:[{"email":partnerCredentials.username},{"ph_no":partnerCredentials.username}],is_Active:true});
        console.log("findPartner ",findPartner);
        if(!findPartner){
            response.message = "Un authorised credentials or you are not verified yet!! Try to contact Admin";
            return response;
        }
        let partnerPassword = findPartner.password;
        const isValidPassword = await _helper.utility.common.checkPassword(partnerCredentials.password,partnerPassword)
        console.log("isValidPassword ",isValidPassword);
        if(!isValidPassword){
            response.message = "Unauthorised credentials";
            return response;
        }
        response.status = true;
        response.message = "password matched successfully";
        response.payload = findPartner;
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
    
}

const checkActivePartner = async(token) =>{
    let response = {
        status:false,
        message : "invalid token",
        payload : {}
    }
    try{
        if(!token || token ==""){
            return response;
        }
        console.log("Token ",token);
        const decodedData = await _helper.utility.common.decodeToken(token);
        console.log("decodedData ",decodedData);
        if(!decodedData){
            return response;
        }
        let partnerInfo = decodedData.partnerInfo;
        const fetChPatrtner = await usersModel.findOne({_id:partnerInfo._id,is_Active:true});
        console.log("fetChPatrtner ",fetChPatrtner);
        if(!fetChPatrtner){
            return response;
        }
        response.payload = fetChPatrtner;
        response.status = true;
        response.message = "Token Validate";
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const savePartnerDetails = async(curpartnerDeatails,oldPartnerDetails) =>{
    let response = {
        status:false,
        message : "invalid token",
        payload : {}
    }
    try{
        if(curpartnerDeatails.email != oldPartnerDetails.email){
            const fetchPartner = await usersModel.findOne({"email":curpartnerDeatails.email,is_Active:true});
            if(fetchPartner == null || fetchPartner == undefined){
                console.log("Its inside this point");
                response.message = "This email id is already associated with another acconut";
                return response;
            }
        }
        oldPartnerDetails.name =   curpartnerDeatails.name == "" ? oldPartnerDetails.name : curpartnerDeatails.name;
        oldPartnerDetails.ph_no =   curpartnerDeatails.phone == "" ? oldPartnerDetails.ph_no : curpartnerDeatails.phone;
        oldPartnerDetails.email = curpartnerDeatails.email == "" ? oldPartnerDetails.email : curpartnerDeatails.email;
        oldPartnerDetails.streetAddress = curpartnerDeatails.address == "" ? oldPartnerDetails.streetAddress : curpartnerDeatails.address;
        oldPartnerDetails.zipCode =  curpartnerDeatails.zipCode == "" ? oldPartnerDetails.zipCode : curpartnerDeatails.zipCode;
        oldPartnerDetails.city = curpartnerDeatails.city == "" ? oldPartnerDetails.city : curpartnerDeatails.city;
    
        let partnerDeatsils = new usersModel(oldPartnerDetails); 
        partnerDeatsils.save();
        response.status = true;
        response.message = "Data saved successfully";
        response.payload = partnerDeatsils;
        return response;
    }catch(err){
        response.message = err.message;
        return response;
    }
}

const changepasswordForPartner = async (curPasswordDetails,partnerDetails) =>{
    let response = {
        status:false,
        message : "",
    }
    try{
        const checkOldpassword = await _helper.utility.common.checkPassword(curPasswordDetails.currentPassword,partnerDetails.password);
        console.log("checkOldpassword ",checkOldpassword);
        if(!checkOldpassword){
            response.message = "Old password is not matched";
            return response;
        }
        const hash = await _helper.utility.common.encryptPassword(10,curPasswordDetails.newPassword);
        partnerDetails.password = hash;
        partnerDetails.save();
        response.status = true;
        response.message = "Password changed successfully";
        return response;         
    }catch(err){
        response.message = err.message;
        return response;
    }
}


module.exports = {
    addPartner,
    partnerLogin,
    checkActivePartner,
    savePartnerDetails,
    changepasswordForPartner
}
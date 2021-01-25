
const partnerController = require("../../controller/partner");
const emailRegexp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


module.exports.checkQueriesFrom = async (req,res,next) =>{
    const headerToken = req.get('authorizationToken');
    console.log("Its comming here");
    console.log("headerToken ",headerToken);
    if(!headerToken || headerToken == undefined){
        req.is_partner = false;
    }else{
        const checkActive =  await partnerController.checkActivePartner(headerToken);
        if(checkActive.status == false){
            // res.status(500).send({status:false,message:"You are not an active parner"})
            return res.redirect('/partner-login');
        }
        req.is_partner = true;
        req.partner = checkActive.payload;
    }
    next();
}

module.exports.sendQuery = async (req,res,next) =>{
    var {name,phone,email,subject,message} = req.body;
    if(req.is_partner == true){
        email,req.body.email = req.partner.partenrEmail;
        phone,req.body.phone = req.partner.partner_Ph_Number;
    }
    if(!email || email == "" || email == undefined || !(emailRegexp.test(email)) || 
        !phone || phone == "" || phone == undefined || (phone.length !=10)) {
            res.status(500).send({status:false,message: "Please provide your valid contact info to reach you"});
        }
    if(!subject || subject == "" || subject == undefined||
        !message || message == "" || message == undefined){
            res.status(500).send({status:false,message: "Please add your query subject and message"});
        }

    next();
}
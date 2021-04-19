var express = require('express');
var router = express.Router();
const middleware = require('../../middleware/middleware');
const controller = require('../../controller/users');
const { route } = require('./partner');


/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/user-login',
    middleware.api.users.userLogin,
    async (req,res,next)=>{
    try{
        const flag = req.flag;
        let userLogin = await controller.userLogin(req.body.username,flag);
        if(userLogin.status == false){
            return res.status(500).send(userLogin);
        }else{
            return res.status(200).send(userLogin);
        }
    }catch(err){
        return res.status(500).send(err);
    }    
})

router.post('/user-otpchecking',
middleware.api.users.userOtpChecking,
    async (req,res,next) =>{
        try{
            
            const user = req.user;
            let userOtpChecking = await controller.userOptSubmit(user,req.body.otp);
            if(userOtpChecking.status == false){
                return res.status(500).send(userOtpChecking);
            }else{
                return res.status(200).send(userOtpChecking);
            }
        }catch(err){
            return res.status(500).send(err);
        }
    }
)

router.post('/check-user-status',async(req,res) =>{
    const checkUser = await controller.checkActiveUser(req.body.token);
    // console.log("checkPartner ",checkPartner);
    if(checkUser.status == false){
        return res.status(500).send(checkUser);
    }else if(checkUser.status == true){
        return res.status(200).send(checkUser);
    }
})

router.post('/save-user-details',
    middleware.api.users.validateUser,
    middleware.api.users.saveUser,
    async (req,res,next) =>{
            try{
                const curUserDetails = req.user;
                const saveUser = await controller.saveUserDetails(req.body,curUserDetails);
                if(saveUser.status == false){
                    return res.status(500).send(saveUser);
                }else if(saveUser.status == true){
                    return res.status(200).send(saveUser);
                }
            }catch(e){
                console.log("Error for saving details of User");
                return res.status(500).send(e);
            }
    }
)

router.post('/book-ticket',
    middleware.api.users.validateUser,
    middleware.api.users.bookTicket,
    async (req,res,next) =>{
        try{
            const curUserDetails = req.user;
            console.log("Body ",req.body);
            console.log("Seats ",JSON.parse(req.body.seats).length);
            const busDetails = req.busDetails
            const createBooking = await controller.bookTicket(curUserDetails,busDetails,req.body);
            if(createBooking.status == false){
                return res.status(500).send(createBooking);
            }else if(createBooking.status == true){
                return res.status(200).send(createBooking);
            }
        }catch(e){
            console.log("Error during book a Ticket");
            return res.status(500).send({status:false,message:e.message});
        }
    }
)

router.post('/confirm-booking',
    middleware.api.users.validateUser,
    middleware.api.users.confirmBooking,
    async(req,res,next) =>{
        try{
            const curUserDetails = req.user;
            const bookingDetails = req.bookingDetails;
            const paymentDetails = req.body;
            const busDetails = req.busDetails;
            const confirmBooking = await controller.confirmBooking(curUserDetails,busDetails,bookingDetails,paymentDetails);
            if(confirmBooking.status == false){
                return res.status(500).send(confirmBooking);
            }else if(confirmBooking.status == true){
                return res.status(200).send(confirmBooking);
            }
        }catch(e){
            console.log("Error while confirming booking");
            return res.status(500).send({status:false,message:e.message});
        }
    }
)

router.get('/fetch-booking-history',
    middleware.api.users.validateUser,
    async(req,res) =>{
        try{
            console.log("Its comming here");
            const curUserDetails = req.user;
            const page = req.query.page;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const bookingHistory = await controller.fetchBookingHistory(curUserDetails,page,startDate,endDate);
            console.log("bookingHistory ",bookingHistory);
            if(bookingHistory.status == false){
                return res.status(500).send(bookingHistory);
            }else{
                return res.status(200).send(bookingHistory);
            }
        }catch(err){
            console.log("Err ",err);
            return res.status(500).send(err);
        }
    });


// router.post('/book-ticket',
//     middleware.api.users.validateUser,
//     middleware.api.users.bookTicket,
//     async (req,res) =>{
//         try{
//             const curUserDetails = req.user;
//             // const saveUser = await controller.saveUserDetails(req.body,curUserDetails);
//             // if(saveUser.status == false){
//             //     return res.status(500).send(saveUser);
//             // }else if(saveUser.status == true){
//             //     return res.status(200).send(saveUser);
//             // }
//         }catch(e){
//             console.log("Error for saving details of partner");
//             return res.status(500).send(e);
//         }
//     }
// )


module.exports = router;

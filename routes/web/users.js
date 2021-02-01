var express = require('express');
var router = express.Router();
const middleware = require('../../middleware/middleware');
const controller = require('../../controller/users');

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
                console.log("Error for saving details of partner");
                return res.status(500).send(e);
            }
    }
)

module.exports = router;

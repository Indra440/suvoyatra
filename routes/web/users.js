var express = require('express');
var router = express.Router();

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.post('/user-login',async (req,res,next)=>{
    console.log("Its comming here");
    let userLogin = await controller.partnerLogin(req.body);
    // if(partnerLogin.status == false){
    //     req.session.message = {
    //         type:'danger',
    //         intro:'Error !! ',
    //         message: partnerLogin.message
    //     }
    //     return res.redirect('/partner-login')   
    // }else if(partnerLogin.status == true){
    //     req.session.message = {
    //         type:'success',
    //         intro:'Success !!',
    //         message: partnerLogin.message
    //     }
    //     let token = jwt.sign({'partnerInfo':partnerLogin.payload},config.get('partnertokenSecret'));
    //     res.status(200).send({"token":token})
    //     // return res.redirect('/partner-dashboard')
    // }
})

module.exports = router;

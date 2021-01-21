const LocalStrategy = require('passport-local').Strategy;
const partnerController = require('../../controller/partner');
// const localPassport = require('passport');

//Load partner Model 
const partnerModel = require('../../models/partners');

module.exports = function(passport){
    console.log("Its hitting")
    passport.use( new LocalStrategy({
		usernameField: 'username',
        passwordField: 'password'
	},function (username,password,done){
            console.log("email in passport ",username);
            console.log("password in passport",password);

            partnerController.partnerLogin({username:username,password:password}).then(partner =>{
                console.log("Partner ",partner);
                if(partner.status == false){
                    return done(null,false,{message :partner.message})
                }
                else if(partner.status == true){
                    return done(null,partner)
                }
            })
            // partnerModel.findOne({partenrEmail:email})
            //     .then(partner =>{
            //         if(!partner){
            //             return done(null,false,{nmessage :' That email is not registered'})
            //         }
            //         bcrypt.compare(password,partner.password,(err,isMatch) =>{
            //             if(err) throw err;
            //             if(isMatch){
            //                 return done(null,partner)
            //             }else{
            //                 return done(null,false,{message:'Password incorrect'})
            //             }
            //         })
            //     })
            //     .catch(err =>{
            //         console.log({"Error ":err})
            //     })

        })
    );
    passport.serializeUser(function(user,done){
        console.log("User under serialize ",partner);
        done(null,user.id)
      });
      
      passport.deserializeUser(function(id,done){
        partnerModel.findOne({ _id: id },(err,user) =>{
            done(err,user)
        })
      });
}
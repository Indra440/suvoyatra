const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let partnersSchema = new Schema({
    name:{
        type:String,
        default:null,
        required:true
    },
    ph_no:{
        type:String,
        default:null,
        required:true
    },
    email:{
        type:String,
        default:null,
        required:true
    },
    userType:{
        type:String,
        default:2, //partner:2,admin:1
        required:false
    },
    is_Active:{
        type:Boolean,
        default:true,
        required:false
    },
    password:{
        type:String,
        default:'one way',
        required:true
    },
    streetAddress:{
        type:String,
        default:''
    },
    zipCode:{
        type:String,
        default:''
    },
    city:{
        type:String,
        default:''
    }
},{
    timestamps:true
})

module.exports = mongoose.model("users",partnersSchema);
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let partnersSchema = new Schema({
    partnerName:{
        type:String,
        default:null,
        required:true
    },
    partner_Ph_Number:{
        type:String,
        default:null,
        required:true
    },
    partenrEmail:{
        type:String,
        default:null,
        required:true
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

module.exports = mongoose.model("partner",partnersSchema);
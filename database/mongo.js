const config = require("config");
const mongoose = require("mongoose");

const host = config.get('database.mongodb.host');
const db_name = config.get('database.mongodb.db_name');
const port = config.get('database.mongodb.port');

const connectionString = `mongodb://${host}:${port}/${db_name}`;

mongoose.connect(connectionString,{useNewUrlParser:true,useUnifiedTopology: true })

mongoose.connection.once('open',function(){
    console.log("Mongodb connected successfully");
}).on('error',function(error){
    console.log("error is :-",error);
})
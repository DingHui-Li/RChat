var mongoose =require('../Dao/connectDB')

var sessionSchema=mongoose.Schema({
    _id:String,
    userid:String,
    terminal:String,
    session:String,
    expires:Date
});

module.exports=mongoose.model('session',sessionSchema);
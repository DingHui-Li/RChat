var mongoose=require('../Dao/connectDB')
var socketSchema=mongoose.Schema({
    userid:{
        type:String,
        required: true
    },
    socketid:{
        type:String,
        required:true
    }
});

module.exports=mongoose.model('socket',socketSchema);
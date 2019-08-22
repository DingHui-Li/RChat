var mongoose =require ('../Dao/connectDB')

var chatSchema=mongoose.Schema({
    _id:{
        type:mongoose.Schema.ObjectId
    },
    userid:String,
    friendid:String,
    chat:String,
    time:{
        type:Date
    },
    read:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('chat',chatSchema);
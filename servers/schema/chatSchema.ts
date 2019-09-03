var mongoose =require ('../Dao/connectDB')

var chatSchema=mongoose.Schema({
    _id:{
        type:mongoose.Schema.ObjectId
    },
    userid:{
        type:String,
        required: true
    },
    friendid:{
        type:String,
        required: true
    },
    chat:String,
    time:{
        type:Date
    },
    type:{
        type:String,
        default:'text'
    }
})

module.exports=mongoose.model('chat',chatSchema);
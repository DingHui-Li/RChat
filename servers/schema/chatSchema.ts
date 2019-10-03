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
    type:{//消息类型：text,video,voice,phone
        type:String,
        default:'text'
    },
    chatType:{//聊天类型：user,system,group
        type:String,
        default:'user'
    }
})

module.exports=mongoose.model('chat',chatSchema);
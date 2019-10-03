var mongoose =require('../Dao/connectDB')
const apply=mongoose.Schema({
    user:{//请求者id
        type:String,
        required: true,
        ref:'user'
    },
    friend:{//被请求者id
        type:String,
        required:true,
        ref:'user'
    },
    msg:{
        type:String,
        default:"请求添加你为好友"
    },
    status:{//状态：new(新增),agree(同意),reject(拒绝),ignore(忽略)
        type:String,
        required:true,
        default:'new'
    },
    time:{
        type:Date,
        required:true
    }
})

module.exports=mongoose.model('apply',apply);
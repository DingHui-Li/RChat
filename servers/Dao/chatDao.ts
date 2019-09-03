var ObjectId = require('mongodb').ObjectID;
export default class chatDao{
    mogoose=require('../Dao/connectDB');
    Chat=require('../schema/chatSchema');
    ChatList=require('../schema/chatListSchema');
    constructor(){}

    newMsg(chat:any):Promise<any>{
        return new Promise(resolve=>{
            chat.save(function(err:any,chat:any){
                if(err){
                    console.log(err);
                    return resolve({'code':500,'msg':'系统错误'});
                }else{
                    return resolve ({'code':200,'msg':'发送成功','msgData':chat});
                }
            })
        })
        
    }

    getChat(userid:String,friendid:String,time:any,offset:number):Promise<any>{
        return new Promise(resolve=>{
            let time_=new Date(time);
            time_.setHours(0,0,0);
            time_.setDate(time_.getDate()-offset);
            //===============================我发送的===============================别人发送给我的==========================
            this.Chat.find({$or:[{'userid':userid,'friendid':friendid},{'userid':friendid,'friendid':userid}]})
                    .where({'time':{$gte:time_}})
                    .sort({'time':1})
                    .exec((err:any,chats:any)=>{
                        if(err){
                            console.error(err)
                            return resolve({'code':500,'msg':'系统错误 '});
                        } else{
                            return resolve({'code':200,'msg':'获取成功','data':chats})
                        }
                    }) 
        })
    }

    getChatNum(userid:any,friendid:any):Promise<any>{
        return new Promise(resolve=>{
            this.Chat.count()
                    .where({$or:[{'userid':userid,'friendid':friendid},{'userid':friendid,'friendid':userid}]})
                    .exec((err:any,count:any)=>{
                        if(err){
                            console.log(err);
                            return resolve({'code':500,'msg':'系统错误'});
                        }else{
                            return resolve({'code':200,'count':count});
                        }
                    })
        })
    }
}
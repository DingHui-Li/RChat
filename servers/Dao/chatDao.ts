var ObjectId = require('mongodb').ObjectID;
export default class chatDao{
    mogoose=require('../Dao/connectDB');
    Chat=require('../schema/chatSchema');
    constructor(){}

    newMsg(chat:any):Promise<any>{
        return new Promise(resolve=>{
            chat.save(function(err:any,chat:any){
                if(err){
                    console.log(err);
                    return resolve({'code':500,'msg':'系统错误'});
                }else{
                    return resolve ({'code':200,'msg':'发送成功','data':chat});
                }
            })
        })
        
    }

    getChat(time:any,userid:String,friendid:String,offset:number,limit:number):Promise<any>{
        return new Promise(resolve=>{
                     //===============================我发送的===============================别人发送给我的==========================
                     this.Chat.find({$or:[{'userid':userid,'friendid':friendid},{'userid':friendid,'friendid':userid}]})
                    //  .skip(offset)
                    //  .limit(limit)
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
}
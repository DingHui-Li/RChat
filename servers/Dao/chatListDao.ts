var ObjectId = require('mongodb').ObjectID;
export default class chatListDao{
    ChatList=require('../schema/chatListSchema');
    constructor(){}
    getChatList(userid:String):Promise<any>{
        return new Promise(resolve=>{
            this.ChatList.find({'userid':userid})
                        .populate({path:'friendid',select:['_id','avatar','name']})
                        .sort({'time':-1})
                        .exec(function(err:any,chatList:any){
                            if(err){
                                console.log(err);
                                return resolve({'code':500,'msg':'系统错误'});
                            }else{
                                return resolve({'code':200,'msg':'获取chatlist成功','data':chatList});
                            }
                        })
        })
    }

    addChatList(chatList:any):Promise<any>{
        return new Promise(resolve=>{
            let options={
                new:true,//返回修改后的文档而不是原始文档
                upsert:true,//如果对象不存在，则创建该对象
                setDefaultsOnInsert:true,//如果upsert选项为true，在新建时插入文档定义的默认值
            };
            let conditions={
                'userid':chatList.userid,
                'friendid':chatList.friendid,
            };
            this.ChatList.findOneAndUpdate(conditions,chatList,options)
                        .populate({path:'friendid',select:['_id','avatar','name']})
                        .exec(function(err:any,result:any){
                            if(err){
                                console.log(err);
                                return resolve({'code':500,'msg':'系统错误'});
                            }else{
                                return resolve({'code':200,'msg':'更新列表成功','data':result});
                            }
                        })
        })
    }

    getNewMsgNum(userid:any,friendid:any):Promise<any>{
        return new Promise(resolve=>{
            let conditions={
                'userid':userid,
                'friendid':friendid,
            };
            this.ChatList.findOne(conditions).select('newMsgNum').exec(function(err:any,num:any){
                if(err){
                    console.log(err);
                }else{
                    if(num!==null){
                        return resolve(num.newMsgNum);
                    }
                    else return resolve(0);
                }
            })
        })
    }

    remove(id:any):Promise<any>{
        return new Promise(resolve=>{
            this.ChatList.deleteOne({'_id':ObjectId(id)})
                        .exec(function(err:any,result:any){
                            if(err){
                                console.log(err);
                                return resolve({'code':500,'msg':'系统错误'});
                            }else{
                                console.log(result);
                                return resolve({'code':200,'msg':'删除成功'});
                            }
                        })
        })
    }

    clearMsgNum(userid:any,friendid:any){
        this.ChatList.updateOne({'newMsgNum':0})
                    .where({'userid':userid,'friendid':friendid})
                    .exec();
    }
}
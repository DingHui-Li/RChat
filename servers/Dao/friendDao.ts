export default class friendDao{
    mongoose = require('./connectDB');
    Friend = require('../schema/friendSchema');
    Socket = require('../schema/socketSchema');

    add(userid:string,friendid:string):Promise<any>{//添加好友
        return new Promise(async resolve=>{
            let friend=new this.Friend({
                'user':userid,
                'friend':friendid,
                'time':new Date()
            });
            let user=new this.Friend({
                'user':friendid,
                'friend':userid,
                'time':new Date()
            });
            let exist=await this.isFriend(userid,friendid);
            if(exist.isFriend) return;
            friend.save(async (err:any,result:any)=>{
                if(err){
                    return resolve({'code':500,'msg':'系统错误'});
                }else{
                    let exist=await this.isFriend(friendid,userid);
                    if(exist.isFriend) return;
                    user.save(function(err:any){
                        if(err){
                            return resolve({'code':500,'msg':'系统错误'})
                        }else{
                            return resolve({'code':200})
                        }
                    })
                }
            })
        })
    }

    getFriendList(id:string):Promise<any>{//获取好友列表
        return new Promise(resolve=>{
            this.Friend.find({'user':id})
                        .populate({path:'friend',select:['_id','name','avatar','descText']})
                        .select(['friend'])
                        .exec(async (err:any,users:any)=>{
                            if(err){
                                return resolve({'code':500,'msg':'系统错误'})
                            }
                            else{
                                let data=new Array<any>();
                                for(let i=0;i<users.length;i++){
                                    data[i]=JSON.parse(JSON.stringify(users[i].friend));
                                    data[i]['line']=false;
                                }
                                let lineState:any=await this.getLineState(data.map(item=>item._id));//查询在线状态
                                for(let i=0;i<data.length;i++){//插入在线状态数据
                                    for(let j=0;j<lineState.data.length;j++){
                                        if(data[i]._id+''===lineState.data[j].userid){
                                            data[i]['line']=true;
                                            break;
                                        }
                                    }
                                }
                                return resolve({'code':200,'msg':'获取好友列表成功','data':data});
                            }
                        })
        })
    }
    getFriendsId(id:string):Promise<any>{//获取好友id列表
        return new Promise(resolve=>{
            this.Friend.find({'user':id})
                        .select(['friend'])
                        .exec((err:any,result:any)=>{
                            if(err){
                                return resolve({'code':500})
                            }else{
                                return resolve({'code':200,'data':result});
                            }
                        })
        })
    }

    isFriend(user:string,friend:string):Promise<any>{//判断是否是好友
        return new Promise(resolve=>{
            this.Friend.findOne({'user':user,'friend':friend})
                    .exec(function(err:any,result:any){
                        if(err){
                            console.error(err);
                            return resolve({'code':500,'msg':'系统错误'});
                        }
                        if(result){
                            return resolve({'code':200,'isFriend':true})
                        }else{
                            return resolve({'code':400,'isFriend':false})
                        }
                    })
        })
    }

    getLineState(ids:Array<string>):Promise<any>{
        return new Promise(resolve=>{
            this.Socket.find({'userid':{$in:ids}})
                        .select(['userid'])
                        .exec(function(err:any,result:any){
                            if(err){
                                console.log(err);
                                return resolve({'code':500})
                            }else{
                                return resolve({'code':200,'data':result});
                            }
                        })
        })
    }

    getLineStateOne(id:string):Promise<any>{
        return new Promise(resolve=>{
            this.Socket.findOne({'userid':id})
                        .exec(function(err:any,result:any){
                            if(err){
                                return resolve({'code':500,'msg':'系统错误'})
                            }
                            if(result){
                                return resolve({'code':200,'line':true});
                            }
                            return resolve({'code':200,'line':false});
                        })
        })
    }

    delete(user:string,friend:string):Promise<any>{
        return new Promise(resolve=>{
            this.Friend.deleteOne({user,friend}).exec((err:any,result:any)=>{
                if(err){
                    return resolve({'code':500,'msg':err})
                }else{
                        this.Friend.deleteOne({'user':friend,'friend':user}).exec((err:any,result:any)=>{
                            if(err){
                                return resolve({'code':300,'msg':'已从成功我的好友列表中删除对方，但并未成功从对方好友列表中删除你-系统错误'})
                            }else{
                                return resolve({'code':200});
                            }
                        })
                }
            });
            
        })
    }
}
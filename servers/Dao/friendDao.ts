export default class friendDao{
    mongoose = require('./connectDB');
    Friend = require('../schema/friendSchema');
    Socket = require('../schema/socketSchema')

    getFriendList(id:string):Promise<any>{
        return new Promise(resolve=>{
            this.Friend.find({'user':id})
            .populate({path:'friend',select:['_id','name','avatar','descText']})
            .exec(async (err:any,users:any)=>{
                if(err){
                    return resolve({'code':500,'msg':'系统错误'})
                }
                else{
                    let data=new Array<any>();
                    for(let i=0;i<users.length;i++){
                        data[i]=JSON.parse(JSON.stringify(users[i].friend[0]));
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

    isFriend(user:string,friend:string):Promise<any>{
        return new Promise(resolve=>{
            this.Friend.findOne({'user':user,'friend':friend}).then(function(err:any,result:any){
                if(err){
                    return resolve({'code':500,'msg':'系统错误'});
                }
                if(result!=null){
                    return resolve({'code':200,'msg':'已经是好友了'})
                }else{
                    return resolve({'code':500,'msg':'不是好友关系'})
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

}
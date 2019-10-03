import FriendDao from './friendDao';

export default class applyDao {
    mongoose=require('./connectDB');
    Apply=require('../schema/applySchema');
    fd=new FriendDao();
    constructor(){}

    add(user:string,friend:string):Promise<any>{
        return new Promise(async resolve=>{
            let apply=new this.Apply({
                user,
                friend,
                'time':new Date()
            })
            let check=await this.check(apply);
            if(check.code!==200) return resolve(check);
            apply.save(function(err:any,result:any){
                if(err){
                    return resolve({'code':500,'msg':'系统错误'});
                }else{
                    return resolve({'code':200,'msg':'已发出请求，等待对方处理','result':result});
                }
            })
        })
    }

    updateStatus(id:string,status:string):Promise<any>{
        return new Promise(resolve=>{
            this.Apply.update({"_id":id},{status}).exec(function(err:any,result:any){
                if(err){
                    console.log(err);
                    return resolve({'code':500})
                }else{
                    console.log(result)
                    return resolve({'code':200})
                }
            });
        })
    }

    check(apply:any):Promise<any>{//若已申请且未处理，或已同意，或已经是好友关系则不再添加新请求
        return new Promise(async resolve=>{
            let result=await this.fd.isFriend(apply.user,apply.friend);
            if(result.isFriend) return resolve({'code':400,'msg':'已是好友'})
            this.Apply.find({'user':apply.user,'friend':apply.friend,'status':'new'})
                    .exec(function(err:any,result:any){
                        if(err){
                            return resolve({'code':500,'msg':'系统错误'})
                        }else{
                            console.log(result)
                            if(result.length===0){
                                return resolve({'code':200});
                            }else{
                                return resolve({'code':400,'msg':'已发出过请求，等待对方处理'})
                            }
                        }
                    })
        })
    }

    getLatelyApplied(user:string):Promise<any>{//获取最近收到的3个申请
        return new Promise(resolve=>{
            this.Apply.find({friend:user,status:'new'})
                        .populate({path:'user',select:['_id','name','avatar']})
                        .select(['user','msg','status'])
                        .sort({time:1})
                        .limit(3)
                        .exec(function(err:any,result:any){
                            if(err){
                                console.log(err);
                                return resolve({'code':500,'msg':err})
                            }else{
                                return resolve({'code':200,'data':result})
                            }
                        })
        })
    }

}
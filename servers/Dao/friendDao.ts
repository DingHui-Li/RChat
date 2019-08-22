export default class friendDao{
    mongoose=require('./connectDB');
    Friend=require('../schema/friendSchema');

    getFriendList(id:any):Promise<any>{
        return new Promise(resolve=>{
            this.Friend.find({'user':id})
            .populate({path:'friend',select:['_id','name','avatar']})
            .exec(function(err:any,users:any){
                if(err){
                   return resolve({'code':500,'msg':'系统错误'})
                }
                else{
                    let data=new Array<any>();
                    for(let i=0;i<users.length;i++){
                        data[i]=users[i].friend[0];
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
}
import friendDao from './friendDao'
const fs=require('fs');
export  default class talkDao{
    mongoose=require('./connectDB');
    Think=require('../schema/thinkSchema');
    fd=new friendDao();

    add(think:any):Promise<any>{
        return new Promise(resolve=>{
            think.save(function(err:any,data:any){
                if(err){
                    return resolve({'code':500})
                }else{
                    return resolve({'code':200,'data':data});
                }
            })
        })
    }

    get(user:string):Promise<any>{
        return new Promise(async resolve=>{
            let friends=await this.fd.getFriendsId(user);
            let friends_id=friends.data.map((item:any)=>(item.friend));
            friends_id.push(user);
            this.Think.find({'user':{$in:friends_id}})
                    .populate({path:'user',select:['_id','name','avatar','cover']})
                    .select(['user','content','isPublic','time','imgs'])
                    .sort({time:-1})
                    .limit(10)
                    .exec(function(err:any,result:any){
                        if(err){
                            return resolve({'code':500});
                        }else{
                            return resolve({'code':200,'data':result});
                        }
                    })
        })
    }

    delete(user:string,id:string):Promise<any>{
        return new Promise(resolve=>{
            this.deleteImg(user,id);
            this.Think.deleteOne({user,'_id':id})
                        .exec(function(err:any,result:any){
                            if(err){
                                return resolve({'code':500,'msg':'系统错误'})
                            }else{
                                if(result.deletedCount===1){
                                    return resolve({'code':200});
                                }else{
                                    return resolve({'code':500,'msg':'未知错误'});                                    
                                }
                            }
                        })
        })
    }
    deleteImg(user:string,id:string){
        this.Think.findOne({user,'_id':id})
                    .select(['imgs'])
                    .exec(function(err:any,result:any) {
                        if(err){
                            console.log(err);
                        }else{
                            if(!result) return;
                            for(let i=0;i<result.imgs.length;i++){
                                let path='./public'+result.imgs[i].substring(0,result.imgs[i].indexOf('?'));
                                fs.unlink(path,(err:any)=>{
                                    if(err) console.log(err);
                                });
                            }
                        }
                    })
    }

    getPerson(user:string):Promise<any>{
        return new Promise(resolve=>{
            this.Think.find({user})
                        .sort({time:-1})
                        .limit(10)
                        .exec(function(err:any,result:any){
                            if(err){
                                return resolve({'code':500})
                            }else{
                                return resolve({'code':200,'data':result});
                            }
                        })
        })
    }
}
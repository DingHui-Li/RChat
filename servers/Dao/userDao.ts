
export default class userDao{
    mongoose:any = require('./connectDB');
    User:any=require('../schema/userSchema');
    constructor(){
        
    }
    add(user:any):Promise<any>{//注册
        return new Promise(async (resolve)=>{
                let result =await this.exist(user);
                if(!result){
                    user.save(function(err:any,u:any){
                        if(err){
                            console.log(err);
                            return resolve({'code':500,'msg':'系统错误'});
                        }
                        else{
                            return resolve({'code':200,'msg':'注册成功'})
                        };  
                    })
                }else{
                    return resolve({'code':500,'msg':'该账号已存在'});
                }
        })
    }

    login(user:any):Promise<any>{//登陆
        return new Promise(async (resolve)=>{
            let result =await this.exist(user);
            if(result){
                this.User.findOne({name:user.name,pw:user.pw})
                .select(['_id','avatar','name','cover'])
                .then((result:any)=>{
                    if(result==null){
                        return resolve({"code":500,'msg':'密码错误'});
                    }else{
                        return resolve({'code':200,'msg':'登陆成功','data':result});
                    }
                });
            }else{
                return resolve({'code':500,'msg':'该账号不存在'});
            }
        })
    }

    exist(user:any):Promise<boolean>{//判断是否存在
        return new Promise(resolve=>{
            this.User.findOne({name:user.name}).then((result:any)=>{
                if(!result){
                    resolve(false);
                }else{
                    resolve(true);
                }
            });
        })
    }

    getInfo(id:string):Promise<any>{
        return new Promise(resolve=>{
            this.User.findOne({'_id':id})
                    .select(['_id','avatar','cover','name','descText','sex','location'])
                    .exec(function(err:any,result:any){
                        if(err){
                            return resolve({'code':500});
                        }else{
                            return resolve({'code':200,'data':result});
                        }
                    })
        })
    }

    search(keyword:string):Promise<any>{
        return new Promise(resolve=>{
            this.User.find({name:{$regex:keyword}})
                    .select(['_id','avatar','name','sex','location'])
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

    setCover(user:string,cover:any):Promise<any>{
        return new Promise(resolve=>{
            this.User.update({'_id':user},{cover})
                    .exec(function(err:any){
                        if(err){
                            return resolve({'code':500})
                        }else{
                            return resolve({'code':200});
                        }
                    })
        })
    }
    setAvatar(user:string,avatar:any):Promise<any>{
        return new Promise(resolve=>{
            this.User.update({'_id':user},{avatar})
                    .exec(function(err:any){
                        if(err){
                            return resolve({'code':500})
                        }else{
                            return resolve({'code':200});
                        }
                    })
        })
    }
}
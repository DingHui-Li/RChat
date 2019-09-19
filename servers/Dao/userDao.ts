
export default class userDao{
    mongoose:any = require('./connectDB');
    User:any=require('../schema/userSchema');
    constructor(){
        
    }
    add(user:any):Promise<any>{//注册
        return new Promise(async (resolve)=>{
            //  this.exist(user).then((result:boolean)=>{
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
            //  })  
        })
       
    }
    login(user:any):Promise<any>{//登陆
        return new Promise(async (resolve)=>{
            let result =await this.exist(user);
            if(result){
                this.User.findOne({name:user.name,pw:user.pw})
                .select(['_id','avatar','name'])
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
                if(result==null){
                    resolve(false);
                }else{
                    resolve(true);
                }
            });
        })
    }
}
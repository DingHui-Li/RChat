
export default class socketDao{
    mongoose=require('./connectDB');
    Socket=require('../schema/socketSchema');
    constructor(){}

    add(userid:string,socketid:string):Promise<any>{
        return new Promise((resolve)=>{
            let options={
                new:true,//返回修改后的文档而不是原始文档
                upsert:true,//如果对象不存在，则创建该对象
                setDefaultsOnInsert:true,//如果upsert选项为true，在新建时插入文档定义的默认值
            };
            let conditions={
                'userid':userid,
            };
            let update={
                'userid':userid,
                'socketid':socketid
            }
            this.Socket.findOneAndUpdate(conditions,update,options)
                        .exec(function(err:any){
                                if(err){
                                    console.log(err);
                                    return resolve({'code':500})
                                }else{
                                    return resolve({'code':200})
                                }
                        })
        })
    }

    get(userid:string):Promise<any>{
        return new Promise(resolve=>{
            this.Socket.find({'userid':userid})
                        .exec(function(err:any,result:any){
                                if(err){
                                    console.log(err);
                                    return resolve('')
                                }else{
                                    if(result.length>0)
                                        return resolve(result[0].socketid);
                                }
                        })
        })
    }

    remove(userid:string):Promise<any>{
        return new Promise(resolve=>{
            this.Socket.deleteOne({'userid':userid})
                        .exec(function(err:any){
                            if(err){
                                console.log(err);
                                return resolve({'code':500});
                            }else{
                                return resolve({'code':200});
                            }
                        })
        })
    }
    removeBySid(socketid:string){
        this.Socket.deleteOne({'socketid':socketid})
                        .exec(function(err:any){
                            if(err){
                                console.log(err);
                            }
                        })
    }
}

export default class sessionDao{
    mongoose=require('./connectDB');
    Session=require('../schema/sessionSchema');
    User:any=require('../schema/userSchema');
    constructor(){

    }

    exist(id:any):Promise<any>{
        return new Promise(resolve=>{
            this.Session.findOne({'userid':id}).then((result:any)=>{
                resolve(result);
            })
        })
    }
    remove(id:any):Promise<any>{
        return new Promise(resolve=>{
            this.Session.deleteMany({'userid':id}).then((result:any)=>{
                resolve(result);
            })
        })
    }
    setUserid(_id:String,id:String,terminal:String){
        this.Session.updateOne({'userid':id,'terminal':terminal})
        .where('_id').equals(_id)
        .then((result:any)=>{
            console.log(result);
        })
    }
}
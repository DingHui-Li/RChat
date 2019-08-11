export default class userDao{
    mongoose:any = require('./connectDB');
    user:any=require('../schema/userSchema');
    constructor(){
        let u=new this.user({name:'test',pw:'sad123'});
        this.add(u)
    }
    add(user:any):boolean{
        user.save(function(err:any,u:any){
            if(err){
                console.log(err);
                return false;
            }        
            console.log(u.info);    
        })
        return false;
    }
}
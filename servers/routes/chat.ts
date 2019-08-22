var express=require('express')
var router=express.Router();
import chatDao from '../Dao/chatDao'
var cd=new chatDao();

const limit=20;

//@params
//page:页数；
//friendid
router.post('/getChat',function(req:any,res:any){
    let page=req.body.page;
    let time=new Date();
    let friendid=req.body.friendid;
    let offset=(page-1)*limit;
    
    cd.getChat(time,req.session.userid,friendid,offset,limit).then(re=>{
        res.json(re);
    })
})

module.exports=router;
var express=require('express')
var router=express.Router();
import chatDao from '../Dao/chatDao'
var cd=new chatDao();
import chatListDao from '../Dao/chatListDao'
var cld=new chatListDao();

router.post('/getChat',async function(req:any,res:any){
    let time=req.body.time;
    let friendid=req.body.friendid;
    let offset=1;
    let countResult=await cd.getChatNum(req.session.userid,friendid);
    cld.clearMsgNum(req.session.userid,friendid);
    while(offset++){//获取time 0点起 offset天前的数据
        let result=await cd.getChat(req.session.userid,friendid,time,offset);
        if(result.data.length>=20||result.data.length>=countResult.count){//若当天数据不足20条则继续查询前一天
            return res.json(result);
        }
    }
   
})

router.get('/getChatList',function(req:any,res:any){
    let id=req.session.userid;
    cld.getChatList(id).then(result=>{
        res.json(result);
    })
})

router.get('/removeChatList',function(req:any,res:any){
    let id=req.query.id;
    cld.remove(id).then(result=>{
        res.json(result);
    })
})

module.exports=router;
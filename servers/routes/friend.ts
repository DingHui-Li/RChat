var express = require('express');
var router = express.Router();
import friendDao from '../Dao/friendDao';
var pd=new friendDao();

router.get('/getFriendList',function(req:any,res:any){//获取当前用户好友列表
    pd.getFriendList(req.session.userid).then(re=>{
      res.json(re);
    });
  })

router.get('/isFriend',function(req:any,res:any){//判断某一用户是否为好友关系；params：friend(用户id)
    let user=req.session.userid;
    let friend=req.body.friend;
    pd.isFriend(user,friend).then(re=>{
        res.json(re);
    })
})


module.exports=router;
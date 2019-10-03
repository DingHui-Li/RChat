var express = require('express');
var router = express.Router();
import friendDao from '../Dao/friendDao';
var fd=new friendDao();
import applyDao from '../Dao/applyDao'
var ad=new applyDao();

router.get('/getFriendList',function(req:any,res:any){//获取当前用户好友列表
    fd.getFriendList(req.session.userid).then(re=>{
      res.json(re);
    });
  })

router.get('/isFriend',function(req:any,res:any){//判断某一用户是否为好友关系；params：friend(用户id)
    let user=req.session.userid;
    let friend=req.body.friend;
    fd.isFriend(user,friend).then(re=>{
        res.json(re);
    })
})
router.get('/isLine',function(req:any,res:any){//判断某一用户是否在线
  fd.getLineStateOne(req.query.id).then(re=>{
    res.json(re);
  })
})
router.post('/delete',function(req:any,res:any){//删除一位好友
  fd.delete(req.session.userid,req.body.id).then(result=>{
    res.json(result);
  });
})
router.post('/applyAction',function(req:any,res:any){
  if(req.body.action==="agree"){
    fd.add(req.session.userid,req.body.userid).then(result=>{
      if(result.code===200){
        ad.updateStatus(req.body.id,req.body.action);
      }
      res.json(result);
    })
  }else{
      ad.updateStatus(req.body.id,req.body.action).then(result=>{
          res.json(result);
      });
  }
  
})

router.get('/getLatelyApply',function(req:any,res:any){
  ad.getLatelyApplied(req.session.userid).then(result=>{
    res.json(result);
  })
})

module.exports=router;
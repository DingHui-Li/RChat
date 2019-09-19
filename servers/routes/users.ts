var express = require('express');
var router = express.Router();
import userDao from '../Dao/userDao';
import sessionDao from '../Dao/sessionDao';
import socketDao from '../Dao/socketDao'
let userSchema=require('../schema/userSchema');
var ud=new userDao();
var sd=new sessionDao();
var skd=new socketDao();
var mongoose= require('../Dao/connectDB');

router.post('/register', function(req:any, res:any, next:any) {
  let name=req.body.name;
  let pw=req.body.pw;
  let time=new Date();
  let id=mongoose.Types.ObjectId();
  ud.add(new userSchema({
    '_id':id,
    'name':name,
    'pw':pw,
    'time':time,
  })).then(re=>{
    res.json(re);
  });
});

router.post('/login',function(req:any,res:any){
  let name=req.body.name;
  let pw=req.body.pw;
  ud.login(new userSchema({'name':name,'pw':pw})).then(async re=>{
      if(re.code==200){//密码验证通过
        let isexist=await sd.exist(re.data._id);
        if(isexist!=null){//若查询到session记录
          let result=await sd.remove(re.data._id);//则删除session
          console.log(result)
        }; 
        req.session.name=name;//重新生成session
        req.session.userid=re.data._id;

        req.session.save((err:any)=>{//为sessions表增加字段
          if(!err){
            sd.setUserid(req.session.id,re.data._id,'web');
          }
        })
      }
      res.json(re);
  });
})

router.get('/exist',function(req:any,res:any){
  let name=req.query.name;
  ud.exist(new userSchema({'name':name})).then(re=>{
    if(re){
      res.json({'code':200,'msg':'该账号已存在'});
    }else{
      res.json({'code':500,'msg':'该账号不存在'});
    }
  })
})
router.get('/logout',function(req:any,res:any){
    req.session.name=undefined;
    if(req.session.userid){
        sd.remove(req.session.userid).then(result=>{
            if(result.code===200) skd.remove(req.session.userid);
            res.json(result);
        });
        
    }else{
      res.json({'code':500});
    }
})

router.get('/checksession',function(req:any,res:any){
  if(req.session.name!=undefined){
    res.json({'code':200,'msg':'已登陆'})
  }else{
    res.json({'code':400,'msg':'未登陆'})
  }
})

module.exports = router;

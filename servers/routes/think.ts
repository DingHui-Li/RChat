var express=require('express')
var router=express.Router();

var Think=require('../schema/thinkSchema');
import thinkDao from '../Dao/thinkDao'
var td=new thinkDao();

router.post('/publish',function(req:any,res:any){
    let think=new Think({
        'user':req.session.userid,
        'content':req.body.content,
        'time':new Date(),
        'isPublic':req.body.isPublic,
        'imgs':req.body.imgs,
        'remind':req.body.remind
    });
    td.add(think).then(result=>{
        res.json(result);
    });
})

router.get('/get',function(req:any,res:any){
    td.get(req.session.userid).then(result=>{
        res.json(result);
    })
})

router.get('/delete',function(req:any,res:any){
    td.delete(req.session.userid,req.query.id).then(result=>{
        res.json(result);
    })
})

router.get('/getPerson',function(req:any,res:any){
    td.getPerson(req.query.id).then(result=>{
        res.json(result);
    })
})

module.exports=router;
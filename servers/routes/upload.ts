var express=require('express');
var router=express.Router();
var fs=require('fs');
var multer =require('multer');

import userDao from '../Dao/userDao'
var ud=new userDao();

let uploadCover=multer({storage:getStorage('./public/uploads/cover')}).single('cover');
router.post('/cover',function(req:any,res:any){
    uploadCover(req,res,function(err:any){
        if(err){
            console.log(err);
            return res.json({'code':500,'err':err})
        }else{
            let path=req.file.path.replace(/public/,'').replace(/\\/g,'/')+'?'+req.body.info;
            ud.setCover(req.session.userid,path).then(result=>{
                if(result.code===200){
                    res.json({'code':200,'path':path});//返回路径
                }else{
                    res.json({'code':500});
                }
            });
        }
    })
})

let uploadAvatar=multer({storage:getStorage('./public/uploads/avtatar')}).single('avatar');
router.post('/avatar',function(req:any,res:any){
    uploadAvatar(req,res,function(err:any){
        if(err){
            console.log(err);
            return res.json({'code':500,'err':err})
        }else{
            let path=req.file.path.replace(/public/,'').replace(/\\/g,'/')+'?'+req.body.info;
            ud.setAvatar(req.session.userid,path).then(result=>{
                if(result.code===200){
                    res.json({'code':200,'path':path});//返回路径
                }else{
                    res.json({'code':500});
                }
            });
        }
    })
});

let uploadImages=multer({storage:getStorage('./public/uploads/images')}).array('images',9);
router.post('/images',function(req:any,res:any){
    uploadImages(req,res,function(err:any){
        if(err){
            console.log(err);
            return res.json({'code':500,'err':err})
        }else{
            let infos=JSON.parse(req.body.infos);
            let paths=[];
            for(let i=0;i<req.files.length;i++){
                let path=req.files[i].path.replace(/public/,'').replace(/\\/g,'/')
                paths.push(path+"?"+infos[i])
            }
            res.json({'code':200,paths});
        }
    })
})

router.post('/delete',async function(req:any,res:any) {
    let imgs=req.body.imgs;
    if(!imgs) return res.json({'code':500});
    if(Array.isArray(imgs)){
        for(let i=0;i<imgs.length;i++){
            let path='./public'+imgs[i].substring(0,imgs[i].indexOf('?'));
            fs.unlink(path,(err:any)=>{
                if(err){ 
                    console.log(err);
                } 
            })
        }
    }else{
        let path='./public'+imgs.substring(0,imgs.indexOf('?'));
        fs.unlink(path,(err:any)=>{
            if(err){
                console.log(err);
            } 
        })
    }
    return res.json({'code':200});
})

function getStorage(path:string){
    return multer.diskStorage({
        destination: async function (req:any, file:any, cb:any) {
            let exist=await fs.existsSync(path)
            if(!exist) fs.mkdir(path, { recursive: true },(err:any)=>{console.log(err)});
            cb(null, path)
        },
        filename:function(req:any,file:any,cb:any){
            let index=file.mimetype.indexOf('/');
            cb(null,Date.now()+'.'+file.mimetype.substr(index+1));
        }
    });
}
module.exports=router;
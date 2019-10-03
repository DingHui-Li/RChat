var express = require('express');
var bodyParser = require('body-parser');
var session=require('express-session')
var mongoose =require('./Dao/connectDB');
var MongoStore=require('connect-mongo')(session);
var app = express();
export var server=require('http').Server(app)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({//session
    secret:'dsfsdtsasf2345sd',
    resave:true,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60*24*14},//14天
    store:new MongoStore({
        mongooseConnection:mongoose.connection
    })
}))

app.all('*', function (req:any, res:any, next:any) {//过滤器
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials','true');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    //res.header('Content-Type', 'application/json;charset=utf-8');
    var filter=require('./util/filter')
    if(filter(req.url,res)){
        if(req.session.name!=undefined){
            next();
        }else{
            res.json({'code':400,'msg':'未登录'});
        }
    }else{
        next();
    }

    // if(req.url.indexOf('/images')!=-1){
    //     res.header("Content-Type","image/jpeg")
    // }
});

app.use(express.static('public')); //静态文件

var usersRouter = require('./routes/users.ts');//路由
var friendRouter=require('./routes/friend.ts')
var chatRouter=require('./routes/chat.ts')
var thinkRouter=require('./routes/think.ts');
var uploadRouter=require('./routes/upload.ts')
app.use('/user', usersRouter);
app.use('/friend',friendRouter);
app.use('/chat',chatRouter);
app.use('/think',thinkRouter);
app.use('/upload',uploadRouter);


server.listen(4000,()=>{
    console.log('listening 4000!!!');
})

import chatSocket from './util/chatSocket'//socket
const io=require('socket.io')(server);
io.of('/server/chat').on('connection',chatSocket)

export default io; 

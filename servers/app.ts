var express = require('express');
var bodyParser = require('body-parser');
var session=require('express-session')
var mongoose =require('./Dao/connectDB');
var MongoStore=require('connect-mongo')(session);
var app = express();
export var server=require('http').Server(app)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// var Friend=require('./schema/friendSchema')
// var f=new Friend({'user':'5d5cbb51b41ac75a2c56e04b','friend':'5d56a38598f03826fce85a20'});
// f.save();
// var f2=new Friend({'user':'5d5cbb51b41ac75a2c56e04b','friend':'5d56b6b3f292965ed01c6c03'});
// f2.save();
// var f3=new Friend({'friend':'5d5cbb51b41ac75a2c56e04b','user':'5d56a38598f03826fce85a20'});
// f3.save();
// var f4=new Friend({'friend':'5d5cbb51b41ac75a2c56e04b','user':'5d56b6b3f292965ed01c6c03'});
// f4.save();

app.use(session({
    secret:'dsfsdtsasf2345sd',
    resave:true,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60*24*14},//14天
    store:new MongoStore({
        mongooseConnection:mongoose.connection
    })
}))

app.all('*', function (req:any, res:any, next:any) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials','true');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Content-Type', 'application/json;charset=utf-8');
    var filter=require('./routes/filter')
    if(filter(req.url,res)){
        if(req.session.name!=undefined){
            next();
        }else{
            res.json({'code':400,'msg':'未登录'});
        }
    }else{
        next();
    }

    if(req.url.indexOf('/images')!=-1){
        res.header("Content-Type","image/jpeg")
    }
  });

app.use(express.static('public')); 

var usersRouter = require('./routes/users.ts');
var friendRouter=require('./routes/friend.ts')
var chatRouter=require('./routes/chat.ts')
app.use('/user', usersRouter);
app.use('/friend',friendRouter);
app.use('/chat',chatRouter);


server.listen(4000,()=>{
    console.log('listening 4000!!!');
})

import chatSocket from './util/chatSocket'
var io=require('socket.io')(server);
io.of('/chat')
    .on('connection',chatSocket)


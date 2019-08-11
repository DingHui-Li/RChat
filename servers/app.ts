import userDao from './Dao/userDao'
var express = require('express');
var usersRouter = require('./routes/users.ts');

var app = express();

let ud:userDao=new userDao();
app.use('/user', usersRouter);

app.listen(4000,()=>{
    console.log('listening 4000!!!');
})

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Login from './views/login.jsx'
import App from './views/App.jsx'
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route} from "react-router-dom";
import axios from 'axios'
import {SnackbarProvider} from 'notistack'
import {apiHost,chatSocket} from './config'

export const axiosInstance=axios.create();
axiosInstance.interceptors.request.use(function(req){
    req.withCredentials=true;
    return req;
},function(err){
    return Promise.reject(err);
})
axiosInstance.interceptors.response.use(function(res){
        if(res.data.code===400){
            alert(res.data.msg);
        }
        return res;
},function(err){
    //alert('服务器响应错误')
    return Promise.reject(err);
})

export const globalContext=React.createContext();

function Index(){
    let info=""; 
    if(localStorage['userInfo']!=undefined){
        info=JSON.parse(localStorage['userInfo']); 
    } 
    const [globalData,setGlobalData]=useState({'userInfo':info});

    function userInfoUpdate(info){
        setGlobalData({...globalData,['userInfo']:info});
    }
    return(
        <globalContext.Provider value={globalData}>
            <SnackbarProvider autoHideDuration={2000}>
                <Router>
                    <Route exact path="/login" render={()=>(<Login onUserInfoChange={userInfoUpdate}></Login>)}/>
                    <Route exact path="/" component={App} />
                </Router>
            </SnackbarProvider>
        </globalContext.Provider>
    )
}

ReactDOM.render((
    <Index />
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

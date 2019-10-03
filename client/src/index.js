// import 'babel-polyfill/node_modules/core-js'
// import 'babel-polyfill/node_modules/regenerator-runtime/runtime'
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Login from './views/login.jsx'
import App from './views/App.jsx'
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router, Route} from "react-router-dom";
import axios from 'axios'
import {SnackbarProvider} from 'notistack'
import {apiHost,chatSocket} from './config'
import GlobalContext from './context/globalContext'

export const axiosInstance=axios.create();
axiosInstance.interceptors.request.use(function(req){
    req.withCredentials=true;
    return req;
},function(err){
    return Promise.reject(err);
})
axiosInstance.interceptors.response.use(function(res){
        if(res.data.code===400){
            console.log(res.data.msg);
        }
        return res;
},function(err){
    //alert('服务器响应错误')
    return Promise.reject(err);
})

function Index(){
    return(
        <GlobalContext>
            <SnackbarProvider autoHideDuration={3000}  anchorOrigin={{vertical:'top',horizontal:'center'}}  preventDuplicate={true}>
                <Router>
                    <Route exact path="/login" render={()=>(<Login></Login>)}/>
                    <Route exact path="/" component={App} />
                </Router>
            </SnackbarProvider>
        </GlobalContext>
    )
}

ReactDOM.render((
    <Index />
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

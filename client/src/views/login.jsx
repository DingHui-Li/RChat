import React, { useEffect, useState } from 'react'
import {Grid,Button,Paper,Card,CardContent,TextField,Typography} from '@material-ui/core'
import '../css/login.css'
import SendIcon from '@material-ui/icons/Send'
import ArrowBack from '@material-ui/icons/ArrowBackIos'
import 'animate.css'
import {axiosInstance as Axios} from'../index'
import {apiHost} from '../config'
import {withRouter } from 'react-router-dom'
import {useSnackbar} from 'notistack'
import md5 from 'md5'

function Login(props){
    let welcomeRef=React.createRef();
    let loginRef=React.createRef(0);
    let icon=React.createRef();
    let button=React.createRef();
    let loginPanel=React.createRef();

    const [user,setUser]=useState({
        name:'',
        nameHelperText:'',
        pw:'',
        pwHelperText:'',
        confirmPw:'',
        confirmPwHelperText:'',
        isConfirm:false,
    });
    const [isWelcome,setWelcome]=useState(true);
    const [isLogin,setLogin]=useState(true);
    const [isNext,setNext]=useState(false);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(()=>{
        let parentHeight=welcomeRef.current.clientHeight;
        let parentWidth=welcomeRef.current.clientWidth;
        let height=icon.current.clientHeight;
        let width=icon.current.clientWidth;
        center(icon.current,height,width,parentHeight,parentWidth);//对齐
        setTimeout(()=>{//上移
            icon.current.style.top='50px';
        },1000);
        height=button.current.clientHeight;
        width=button.current.clientWidth;
        center(button.current,height,width,parentHeight,parentWidth);
        setTimeout(()=>{
            button.current.style.opacity="1";
            button.current.style.transition="opacity 450ms";
        },2000);
    },icon);
    function center(ref,height,width,parentHeight,parentWidth){
        ref.style.top=(parentHeight-height)/2+'px';
        ref.style.left=(parentWidth-width)/2+'px';
    }
    function btnClick(){
        button.current.style.display="none";
        welcomeRef.current.style.height= "100px";
        icon.current.style.cssText="height:50px;width:50px";
        center(icon.current,50,50,100,welcomeRef.current.clientWidth);

        loginRef.current.style.height=window.innerHeight-100+'px';
        setWelcome(false);
    }
    const inputChange=name=>e=>{
        if(name==="confirmPw"){
            if(e.target.value!==user.pw){
                setUser({ ...user,[name+'HelperText']:'密码不相同',[name]:e.target.value,['isConfirm']:false});                
            }else{
                setUser({ ...user,[name+'HelperText']:'相同',[name]:e.target.value,['isConfirm']:true});
            }
        }
        else if(name==="pw"){
            if(e.target.value!==user.confirmPw){
                setUser({ ...user,['confirmPwHelperText']:'密码不相同',[name]:e.target.value,['isConfirm']:false});                
            }else{
                setUser({ ...user,['confirmPwHelperText']:'相同',[name]:e.target.value,['isConfirm']:true});
            }
        }
        else if(e.target.value.trim().length>0){
            setUser({ ...user,[name+'HelperText']:'',[name]:e.target.value.trim()});
        }else{
            setUser({ ...user,[name+'HelperText']:'不能为空',[name]:e.target.value.trim()});
        }
    }
    function loginOrRegister(){
        setLogin(!isLogin);
    }
    function loginClick(){//登陆
        Axios({
            method:'post',
            url:apiHost+'/user/login',
            data:{'name':user.name,'pw':md5(user.pw)}
        }
        ).then(res=>{
            if(res.data.code===200){
                localStorage['userInfo']=JSON.stringify(res.data.data);
                props.onUserInfoChange(res.data.data);
                props.history.push('/');
            }else{
                enqueueSnackbar(res.data.msg,{
                    variant:'error',
                    preventDuplicate: true,
                    anchorOrigin:{
                        vertical:'top',
                        horizontal:'right'
                    }
                });
            }
        })
    }
    function registerClick(){//注册
        Axios({
            method:'post',
            url:apiHost+'/user/register',
            data:{'name':user.name,'pw':md5(user.pw)}
        }
        ).then(res=>{
            let variantext='error';
            if(res.data.code===200){
                variantext='success';
                setLogin(!isLogin);
            }
            enqueueSnackbar(res.data.msg,{
                variant:variantext,
                anchorOrigin:{
                    vertical:'top',
                    horizontal:'right'
                }
            });
        })
    }
    function exist(){
        return new Promise(reslove=>{
            Axios({
                method:'get',
                url:apiHost+'/user/exist?name='+user.name,
            }).then(res=>{
                return reslove(res.data.code);
            })
        })
        
    }
    async function next(){
        let code=await exist();
        if(code===500){
            if(user.name.trim().length>0){
                setNext(true);
                setUser({
                    ...user,['nameHelperText']:''
                })
            }else{
                setUser({
                    ...user,['nameHelperText']:'用户名不能为空'
                })
            }
        }else{
            setUser({
                ...user,['nameHelperText']:'该用户名已注册'
            })
        }
    }

    function welcome(){
        return(
            <Grid item xs={12} container className={'welcome'} ref={welcomeRef}>
                <div className={'icon animated zoomIn'} ref={icon}>
                    <img height="100%" width="100%" src={require("../asset/icon.png")} alt="LOGO"/>
                </div>
                {/* <Paper ref={button} className={'button'}>
                    <Button onClick={btnClick}>登陆或创建</Button>
                </Paper> */}
                <div ref={button} className={'welButton'} onClick={btnClick}>
                    登陆或创建
                </div>
            </Grid>
        )
    }
    function login(){
        return(
            <Grid item xs={12} container className={'login'} ref={loginRef} justify="center" alignItems="center">
                <Grid item xs={10} sm={7} md={6} lg={5} xl={4}>
                    {
                        !isWelcome&&
                        <Card elevation={4} ref={loginPanel} className="loginPanel animated fadeInDown" key="login">
                            <CardContent>
                                <Typography variant="h5" noWrap={true} style={{marginBottom:'10px'}}>登陆</Typography>
                                <TextField fullWidth label="用户名" value={user.name} onChange={inputChange('name')}/>
                                <TextField fullWidth label="密码" type="password" value={user.pw} style={{margin:'20px 0'}} onChange={inputChange('pw')} />
                                <Typography noWrap={true} className={'tip'}>没有账号？ <span style={{color:'#2196F3'}} onClick={loginOrRegister}>现在创建</span> </Typography> 
                                <Button variant="contained" style={{float:'right',backgroundColor:'#2196F3' ,color:'#fff'}} onClick={loginClick}>
                                    <span style={{marginRight:'10px'}}> 登陆 </span>
                                    <SendIcon />
                                </Button>
                            </CardContent>
                        </Card>
                    }
                </Grid>    
            </Grid>
        )
    }
    function register(){
        return (
                <Grid item xs={12} container justify="center" alignItems='center' className={'login'} ref={loginRef}>
                    <Grid item xs={10} sm={7} md={6} lg={5} xl={4}>
                        <Card elevation={4} className="loginPanel animated fadeInDown" key="register">
                            {
                                !isNext?
                                <CardContent className={'animated fadeInLeft createPanel'} key="createName">
                                    <Typography variant="h5" noWrap={true} style={{marginBottom:'10px'}}>创建</Typography>
                                    <TextField fullWidth placeholder="用户名" value={user.name} error={user.nameHelperText.trim().length>0}
                                        onChange={inputChange('name')} style={{marginBottom:'20px'}} helperText={user.nameHelperText}/>                            
                                    <Typography noWrap={true} className={'tip'}>已有账号？ <span style={{color:'#2196F3'}} onClick={loginOrRegister}>去登陆</span> </Typography> 
                                    <Button style={{float:'right',backgroundColor:'#2196F3' ,color:'#fff'}} onClick={next}>
                                        下一步
                                    </Button>
                                </CardContent>
                                :
                                <CardContent className={'animated fadeInRight createPanel'} key="createPw">
                                    <Typography variant="h5" noWrap={true} style={{marginBottom:'10px'}}>创建密码</Typography>
                                    <Typography noWrap={true} style={{marginBottom:'10px'}}>{user.name}</Typography>
                                    <TextField fullWidth placeholder="密码" type="password" value={user.pw} onChange={inputChange('pw')} 
                                        style={{marginBottom:'20px'}} helperText={user.pwHelperText} error={user.pw.trim().length<=0}/>  
                                    <TextField fullWidth placeholder="确认密码" type="password" value={user.confirmPw} error={!user.isConfirm}
                                         onChange={inputChange('confirmPw')} style={{marginBottom:'20px'}} helperText={user.confirmPwHelperText}/>  
                                    <Button style={{float:'right',backgroundColor:'#2196F3' ,color:'#fff'}} onClick={registerClick}>
                                        创建
                                    </Button> 
                                    <Button style={{float:'right' ,color:'#000',marginRight:'20px'}} onClick={()=>{setNext(false)}}>
                                        <ArrowBack></ArrowBack>
                                    </Button>                         
                                </CardContent>
                            }
                        </Card>
                    </Grid>
                </Grid>
        )
    }
    return(
        <Grid container>
            {welcome()}
            { isLogin?login():register()}
        </Grid>
    )
}
export default withRouter(Login);
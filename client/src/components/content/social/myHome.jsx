import React, { useEffect } from 'react'
import {Avatar, IconButton,Menu,MenuItem,CircularProgress,LinearProgress } from '@material-ui/core'
import {MoreHoriz} from '@material-ui/icons'
import './css/myHome.css'
import {imgHost,apiHost} from '../../../config'
import OneThink from './oneThink'
import {useSnackbar} from 'notistack'
import {axiosInstance as Axios} from '../../../index'
import getImgInfo,{compress} from '../../../util/imgUtil'
import {useGlobal} from '../../../context/globalContext'

export default function MyHome(props){
    const {enqueueSnackbar} =useSnackbar();
    
    const {userInfo,updateUserInfo}=useGlobal();
    const [user,setUser]=React.useState(props.user);//user数据

    const containerRef=React.createRef();
    const userInfoRef=React.createRef();
    const contentRef=React.createRef();
    const avatarRef=React.createRef();

    const [settingMenuAnch,setSettingmenuAnch]=React.useState(null);//显示菜单
    const [data,setData]=React.useState([]);//数据
    const [loadingAvatar,setLoadingAvatar]=React.useState(null);
    const [loadingCover,setLoadingCover]=React.useState(null);
    useEffect(()=>{
        Axios({
            method:'get',
            url:apiHost+'/think/getPerson?id='+props.user._id
        }).then(res=>{
            if(res.data.code===200){
                let temp=res.data.data;
                for(let i=0;i<temp.length;i++){
                    temp[i].user=props.user;
                }
                setData(temp);
            }
        });
    },[props])
    function handleMyHomeScroll(){
        let scrollHeight=containerRef.current.scrollHeight;
        let clientHeight=containerRef.current.clientHeight;
        let scrollTop=containerRef.current.scrollTop;
        if(props.width!=='xs'){
            if(scrollTop===0){
                contentRef.current.style.marginTop=300+'px';
                userInfoRef.current.style.height=300+'px';
                avatarRef.current.style.cssText='width:80px;height:80px;';
            }
            else{
                avatarRef.current.style.cssText='width:50px;height:50px;';
                userInfoRef.current.style.height=60+'px'
                contentRef.current.style.marginTop=60+'px';
            }
        }else{
        }
    }
    function handleUpload(inputEle){
        setSettingmenuAnch(null);
        let input=document.querySelector('#myHome '+inputEle);
        input.click();
    }
    async function HandleUploadAvatar(e){
        e.persist();
        let file=e.target.files[0];
        let fileSize=file.size/1000/1000;
        // if(fileSize>1){
        //     return enqueueSnackbar('头像图片不能超过1M',{variant:"error"});
        // }
        let d=await compress(file,'low');
        let info=await getImgInfo(d);
        let formData=new FormData();
        formData.append('avatar',file);
        formData.append('info',info);
        Axios({
            method:'post',
            url:apiHost+'/upload/avatar',
            data:formData,
            onUploadProgress:(progressEvent)=>{
                let complete = (progressEvent.loaded / progressEvent.total * 100);
                setLoadingAvatar(complete);
            }
        }).then(res=>{
            setLoadingAvatar(null);
            if(res.data.code===200){
                let temp=JSON.parse(JSON.stringify(userInfo));
                temp.avatar=res.data.path;
                updateUserInfo(temp);
                setUser(temp);
            }else{
            enqueueSnackbar('服务器错误',{variant:'error'});
            }
        }).catch(err=>{
            setLoadingAvatar(null);
            enqueueSnackbar('发生错误：'+err,{variant:'error'});
        });
        e.target.value="";
    }
    async function HandleUploadCover(e){
        e.persist();
        let file=e.target.files[0];
        let d=await compress(file);
        let imgInfo=await getImgInfo(d);
        let formData=new FormData();
        formData.append('cover',d);
        formData.append('info',imgInfo);
        Axios({
            method:'post',
            url:apiHost+'/upload/cover',
            data:formData,
            onUploadProgress:progressEvent=>{
                let complete = (progressEvent.loaded / progressEvent.total * 100);
                setLoadingCover(complete);
            }
        }).then(res=>{
            setLoadingCover(null);
            if(res.data.code===200){
                let temp=JSON.parse(JSON.stringify(userInfo));
                temp.cover=res.data.path;
                updateUserInfo(temp);
                setUser(temp);
            }else{
            enqueueSnackbar('服务器错误',{variant:'error'});
            }
        }).catch(err=>{
            setLoadingCover(null);
            enqueueSnackbar('发生错误：'+err,{variant:'error'});
        });
        e.target.value="";
    }
    
    return (
        <div id="myHome" ref={containerRef} onScrollCapture={handleMyHomeScroll}>
            {
                props.width!=='xs'&&
                <div className="userInfo" ref={userInfoRef} onClick={()=>containerRef.current.scrollTop=0}> 
                    {loadingCover&&<LinearProgress variant="determinate" value={loadingCover} className="loadingCover" />}
                    <img src={imgHost+user.cover} className="cover"/>
                    <Avatar src={imgHost+user.avatar} className="avatar" ref={avatarRef}></Avatar>
                    {loadingAvatar&&<CircularProgress className="loadingAvatar" size={80} value={loadingAvatar} variant="determinate"/>}
                    {
                        props.isMe&&
                        <IconButton className="setBtn" onClick={(e)=>setSettingmenuAnch(e.target)}><MoreHoriz style={{color:'rgb(112,128,144)'}}/></IconButton>
                    }
                </div>
            }
            <div className='contentContainer' ref={contentRef} style={{marginTop:props.width==='xs'?'0px':'300px'}}>
                {
                    data.map(item=><OneThink key={item._id} data={item} isMe={props.isMe} width={props.width} />)
                }
            </div>

            <input className="inputAvatar" type="file" style={{display:'none'}} onChange={HandleUploadAvatar} accept ="image/*"/>
            <input className="inputCover" type="file" style={{display:'none'}} onChange={HandleUploadCover} accept ="image/*"/>
            <Menu anchorEl={settingMenuAnch} open={Boolean(settingMenuAnch)} onClose={()=>setSettingmenuAnch(null)}>
                <MenuItem onClick={()=>handleUpload('.inputAvatar')}>上传头像</MenuItem>
                <MenuItem onClick={()=>handleUpload('.inputCover')}>上传封面</MenuItem>
            </Menu>
        </div>
    )
}
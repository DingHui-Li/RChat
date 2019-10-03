import React, { useEffect } from 'react'
import {Button} from '@material-ui/core'
import {useSnackbar} from 'notistack'
import {apiHost,chatSocket} from '../../config'
import {axiosInstance as Axios} from '../../index'
import {useApp} from '../../context/appContext'
import {withRouter} from 'react-router-dom'

function CheckSession(props){
    const {enqueueSnackbar,closeSnackbar} =useSnackbar();
    const {setLine} =useApp();

    const reConnect=(key)=>(
        <Button onClick={()=>{
            chatSocket.open();
            chatSocket.emit('newConnect',{userid:props.userid});
            closeSnackbar(key)
            }}>
            重新连接
        </Button>
    );

    useEffect(()=>{
        chatSocket.on('connect',function(){
            setLine(true);
            enqueueSnackbar('已连接',{
                variant:'success',
                preventDuplicate:true,
                anchorOrigin:{
                    vertical:'top',
                    horizontal:'center'
                }
            });
        });
        chatSocket.on('disconnect',function(socket){
            setLine(false);
            enqueueSnackbar('断开连接',{
            variant:'error',
            action:reConnect,
            persist:true,
            preventDuplicate:true,
            anchorOrigin:{
                vertical:'top',
                horizontal:'center'
            }
            });
        });
        chatSocket.on('error',function(err){
            console.log(err);
            setLine(false);
            enqueueSnackbar('连接错误',{
                variant:'error',
                action:reConnect,
                preventDuplicate:true,
                anchorOrigin:{
                    vertical:'top',
                    horizontal:'center'
                }
            });
        })
        Axios({
            method:'get',
            url:apiHost+'/user/checksession'
        }).then(res=>{
            console.log(res)
            if(res.data.code===200){
                chatSocket.emit('newConnect',{userid:props.userid});
            }else{
                props.history.push('/login')
            }
        })
    },[])

    return null;
}
export default withRouter(CheckSession);
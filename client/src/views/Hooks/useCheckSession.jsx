import React, { useEffect } from 'react'
import {Button} from '@material-ui/core'
import {useSnackbar} from 'notistack'
import {apiHost,chatSocket} from '../../config'
import {axiosInstance as Axios} from '../../index'

export default async function useCheckSession(userid){
    const {enqueueSnackbar,closeSnackbar} =useSnackbar();

    console.log('check Session');
    const reConnect=(key)=>(
        <Button onClick={()=>{
            chatSocket.open();
            chatSocket.emit('newConnect',{userid:userid});
            closeSnackbar(key)
            }}>
            重新连接
        </Button>
    );
    let res= await Axios({
            method:'get',
            url:apiHost+'/user/checksession'
        }).catch(err=>false);
    if(!res.data) return false;
    if(res.data.code===200){
        chatSocket.emit('newConnect',{userid:userid});
        chatSocket.on('connect',function(){
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
        return true;
    }
    return false;
}
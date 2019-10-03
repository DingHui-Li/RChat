import React, { useEffect } from 'react'
import {Paper,Slide,Menu,MenuItem,Button,ButtonBase, IconButton,Fade} from '@material-ui/core'
import {Fullscreen,FullscreenExit,Lock,LockOpen,Close,Mic,MicOff,Airplay,CameraAltTwoTone,CameraAlt,SwapVert,CallEnd} from '@material-ui/icons'
import './css/VAChat.css'
import elementMove from '../../../util/elementMove'
import {chatSocket, imgHost,iceServers} from '../../../config'
import {useGlobal} from '../../../context/globalContext'
import {getDisplayMedia,getCameraMedia} from '../../../util/getMediaStream'
import {useSnackbar} from 'notistack'
import {useApp} from '../../../context/appContext'

export default function VAChat(props){
    const {VAState,update_VAState}=useApp();
    const {chatList_selected}=useApp();
    const [mouseCoord,setMouseCoord]=React.useState({
        x:0,
        y:0
    });
    const {enqueueSnackbar}=useSnackbar();
    const {userInfo}=useGlobal();
    const [isnarrow,setNarrow]=React.useState(true);//窗口缩放
    const [locked,setLock]=React.useState(true);//窗口是否可移动
    const [anchorEl,setAnchorEl]=React.useState(null);//选择菜单锚点
    const [mediaType,setMediaType]=React.useState(0);//数据源类型
    const [isShow,setIsShow]=React.useState(false);//是否显示操作层
    useEffect(()=>{
        if(VAState==="called"){
            setIsShow(true);
        }
    },[VAState])

    function narrow(){
        let ele=document.getElementById('VAChat');
        if(isnarrow){
            ele.style.cssText="width:200px;height:200px;margin:0";
        }else{
            ele.style.width='100%';
            ele.style.height="100%";
            ele.style.margin=0;
        }
        setNarrow(!isnarrow);
    }
    function onMouseMove(e){//移动
        if(!locked){
            let coordinate=elementMove('','#VAChat',mouseCoord,e);
            if(coordinate) setMouseCoord(coordinate);
        }
    }
    function mouseEnter(){
        setIsShow(true);
    }
    function mouseLeave(){
        setIsShow(false);
    }
    function close(){
        update_VAState('close');
        chatSocket.emit('call',{'action':'callend','userid':userInfo._id,'friendid':chatList_selected._id});
        let stream= document.getElementById('selfVideo').srcObject;
        if(stream){
            stream.getTracks().forEach(track=>{
                track.stop();
            });
        };
        window.rpc.getSenders().forEach(sender=>{
            window.rpc.removeTrack(sender);    
        });
        window.rpc.getReceivers().forEach(receiver=>{
            receiver.track.stop();
        })
        window.rpc.close();
        window.rpc=new RTCPeerConnection(iceServers);
    }
    
    function call(){
        return (
            <div className="call" onMouseEnter={()=>{setIsShow(false)}}>
                <div className="userInfo">
                    <img src={imgHost+chatList_selected.avatar} className="avatar"/>
                    <div className="name">{chatList_selected.name}</div>
                </div>
                <div className="hangup">
                    <div style={{marginBottom:'20px',color:'#fff'}}>等待连接...</div>
                    <ButtonBase className='closeBtn' onClick={close}>
                        <CallEnd style={{color:'#fff',width:'30px',height:'30px'}}  />
                    </ButtonBase>
                </div>
            </div>
        )
    }

    async function changeMediaStream(type){
        setAnchorEl(null);
        let stream=null;
        switch(type){
            case 'user':if(stream= await getCameraMedia('user')){
                            setMediaType(0);
                        } break;
            case 'environment':if(stream= await getCameraMedia('environment')){
                            setMediaType(1);
                        } break;
            case 'screen':if(stream= await getDisplayMedia()){
                            setMediaType(2);
                        } break;
        }
        if(stream){
            let srcObject=document.getElementById('selfVideo').srcObject;
            if(srcObject){
                srcObject.getTracks().forEach(track=>{
                    track.stop();
                })
            }
            document.getElementById('selfVideo').srcObject=stream;
            window.rpc.getSenders().forEach(sender=>{
                if(sender.track.kind===stream.getTracks()[0].kind){
                    sender.replaceTrack(stream.getTracks()[0]);
                }
            })
        }
        else enqueueSnackbar('获取数据源错误',{variant:'error'});
    }

    function selectButton(){//选择数据源
        return(
            <React.Fragment>
                    <ButtonBase onClick={(e)=>{ setAnchorEl(e.target)}} className='selectButton'>
                        {
                            mediaType===0&&
                            <CameraAltTwoTone style={{color:'#fff'}} />
                        }
                        {
                            mediaType===1&&
                            <CameraAlt style={{color:'#fff'}} />
                        }
                        {
                            mediaType===2&&
                            <Airplay style={{color:'#fff'}}/>
                        }
                    </ButtonBase>
                    <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={()=>{setAnchorEl(null)}}  keepMounted>
                        <MenuItem onClick={()=>{changeMediaStream('user')}}>
                            <CameraAltTwoTone />前置摄像头
                        </MenuItem>
                        <MenuItem onClick={()=>{changeMediaStream('environment')}}>
                            <CameraAlt />后置摄像头
                        </MenuItem>
                        <MenuItem onClick={()=>{changeMediaStream('screen')}}>
                            <Airplay />屏幕
                        </MenuItem>
                    </Menu>
            </React.Fragment>
        )
    }
    function mediaChange(){//视频流交换
        let srcObject=document.getElementById('selfVideo').srcObject;
        document.getElementById('selfVideo').srcObject=document.getElementById('videoChat').srcObject;
        document.getElementById('videoChat').srcObject=srcObject;
    }
    const selfVideoStyle={
        margin:0,
        width:VAState==='called'?'200px':'100%',
        height:VAState==='called'?'200px':'100%',
        visibility:isnarrow&&VAState!=='false'&&VAState!=='close'&&VAState!=='callend'?'visible':'hidden'
    }
    return (
            <Slide in={VAState!=='false'&&VAState!=='close'&&VAState!=='callend'} timeout={500}>
                <Paper id="VAChat" onMouseMove={(e)=>{onMouseMove(e)}} className='animated fadeIn' onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}
                        style={{margin:0}}
                        onMouseDown={(e)=>{
                            setMouseCoord({['x']:e.clientX,['y']:e.clientY})
                        }}>
                    {VAState==='call'&&call()}
                    <Fade in={isShow}>
                        <div>
                            <Paper className="topbar" elevation={0}>
                                {
                                    isnarrow? 
                                    <FullscreenExit onClick={narrow} className='icon'/>
                                    :
                                    <Fullscreen onClick={narrow} className='icon'/>
                                }
                                {
                                    locked? 
                                    <Lock className='icon' onClick={()=>{setLock(false)}}/>
                                    :
                                    <LockOpen className='icon'  onClick={()=>{setLock(true)}} />
                                }
                            </Paper>
                            <div className="option">
                                {selectButton()}
                                <ButtonBase className='closeBtn' onClick={close} elevation={7}>
                                    <CallEnd style={{color:'#fff',width:'30px',height:'30px'}}  />
                                </ButtonBase>
                                <ButtonBase className="muteBtn">
                                    <Mic style={{color:'#fff'}}/>
                                </ButtonBase>
                            </div> 
                        </div>
                    </Fade>
                    <video id="videoChat" autoPlay onClick={()=>{
                            if(isShow) setIsShow(false);
                            else setIsShow(true);
                    }}></video>
                    <Paper id="selfView" style={selfVideoStyle} 
                            onMouseMove={(e)=>{
                                let coordinate=elementMove('#VAChat','#selfView',mouseCoord,e);
                                if(coordinate) setMouseCoord(coordinate);}}
                    >
                        <video id="selfVideo" autoPlay style={{transform:mediaType===0?' rotateY(180deg)':''}}></video>
                        <IconButton style={{position:'absolute',bottom:0,right:0}} onClick={(e)=>{mediaChange()}}> 
                            <SwapVert  />
                        </IconButton>
                    </Paper>
                </Paper>
            </Slide>
    )
}
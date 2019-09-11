import React, { useEffect } from 'react'
import {Paper,Slide,Menu,MenuItem,Button,ButtonBase, IconButton} from '@material-ui/core'
import {Fullscreen,FullscreenExit,Lock,LockOpen,Close,Mic,MicOff,Airplay,CameraAltTwoTone,CameraAlt,SwapVert,CallEnd} from '@material-ui/icons'
import '../css/VAChat.css'
import {isVAContext} from '../views/App'
import elementMove from '../util/elementMove'
import {chatSocket, imgHost} from '../config'
import {globalContext} from '../index'
import {chatListContext} from '../views/App'

export default function VAChat(props){
    const isVA=React.useContext(isVAContext);
    const [isnarrow,setNarrow]=React.useState(true);
    const [mouseCoord,setMouseCoord]=React.useState({
        x:0,
        y:0
    });
    const [locked,setLock]=React.useState(true);
    const topbarRef=React.createRef();
    const optRef=React.createRef();
    useEffect(()=>{
        if(isVA.value!=='false'&&isVA.value!=='close'&&isVA.value!=='callend'){
            setTimeout(function(){
                if(topbarRef.current){
                    topbarRef.current.style.opacity=0;
                    optRef.current.style.opacity=0;
                }
            },1000);
            (
                async()=>{//进入该界面后首先获取前摄像头
                    let hasFrontCam=await getCameraMedia('user');
                    if(hasFrontCam===true) {
                        setMediaType(0);
                        return;
                    }
                    let hasBackCam=await  getCameraMedia('environment');//若获取不到，则获取后摄像头                  
                    if(hasBackCam===true){
                        setMediaType(1);
                        return;
                    } 
                    let hasDisplay=await  getDisplayMedia();//若获取不到，则捕获屏幕
                    
                    if(hasDisplay===true){
                        setMediaType(2);
                        return;
                    } 
                    isVA.updateIsVA(false);//若失败，则关闭该页面
                    alert(hasDisplay.message);
                }
            )()
        }
    },[isVA.value]);
    useEffect(()=>{
        if(window.rpc){
            window.rpc.ontrack=function(event){
                console.log(event);
            }
        }
    },[window.rpc])
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
        topbarRef.current.style.opacity=1;
        optRef.current.style.opacity=1;
    }
    function mouseLeave(){
        topbarRef.current.style.opacity=0;
        optRef.current.style.opacity=0;
    }
    function close(){
        isVA.updateIsVA('close');
        chatSocket.emit('call',{'action':'callend','userid':userInfo._id,'friendid':friendInfo.value._id});
        let stream= document.getElementById('videoChat').srcObject;
        if(stream){
            stream.getTracks().forEach(function(track){
                console.log(track)
                track.stop();
            });
        }
    }
    function getDisplayMedia(){//获取屏幕数据
        setAnchorEl(null);
        let getDisplayMediaOpt={
            video:{
                cursor:'always'
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        }
    return navigator.mediaDevices.getDisplayMedia(getDisplayMediaOpt).then(function(stream){
                document.getElementById('videoChat').srcObject=stream;
                if(window.rpc){
                    for(const track of stream.getTracks())
                    window.rpc.addTrack(track,stream);
                }
                return true;
            }
        ).catch(function(err){
            return err;
        })
    }
    const userInfo=React.useContext(globalContext).userInfo;
    const friendInfo=React.useContext(chatListContext).selectChat;
    function getCameraMedia(type){//获取摄像头数据
        setAnchorEl(null);
        let opt={
            //audio:true,
            video:{
                facingMode:type,
            }
        }
        return  navigator.mediaDevices.getUserMedia(opt).then(function(stream){
                document.getElementById('videoChat').srcObject=stream;
                if(window.rpc){
                    for(const track of stream.getTracks())
                    window.rpc.addTrack(track,stream);
                }
                return true;
            }).catch(function(err){
                return err;
            })
    }
    function call(){
        return (
            <div className="call">
                <div className="userInfo">
                    <img src={imgHost+friendInfo.value.avatar} className="avatar"/>
                    <div style={{fontSize:'20px',marginTop:'20px',fontWeight:'bold'}}>{friendInfo.value.name}</div>
                </div>
                <div className="hangup">
                    <div style={{marginBottom:'20px',color:'#757575'}}>等待连接...</div>
                    <ButtonBase className='closeBtn' onClick={close}>
                        <CallEnd style={{color:'#fff',width:'30px',height:'30px'}}  />
                    </ButtonBase>
                </div>
            </div>
        )
    }

    const [anchorEl,setAnchorEl]=React.useState(null);
    const [mediaType,setMediaType]=React.useState(0);
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
                        <MenuItem onClick={async ()=>{
                                let re=await getCameraMedia('user');
                                if(re!==true) alert(re.message);
                                else setMediaType(0);
                            }}>
                            <CameraAltTwoTone />前置摄像头
                        </MenuItem>
                        <MenuItem onClick={async ()=>{
                                let re=await getCameraMedia('environment');
                                if(re!==true) alert(re.message);
                                else setMediaType(1);
                            }}>
                            <CameraAlt />后置摄像头
                        </MenuItem>
                        <MenuItem onClick={async()=>{
                                let re=await getDisplayMedia();
                                if(re!==true) alert(re.message);
                                else setMediaType(2);
                            }}>
                            <Airplay />屏幕
                        </MenuItem>
                    </Menu>
            </React.Fragment>
        )
    }
    return (
        <React.Fragment>
            <Slide in={isVA.value!=='false'&&isVA.value!=='close'&&isVA.value!=='callend'} timeout={500}>
            <Paper id="VAChat" onMouseMove={(e)=>{onMouseMove(e)}} className='animated fadeIn'
                    style={{margin:0}}
                    onMouseDown={(e)=>{
                        setMouseCoord({['x']:e.clientX,['y']:e.clientY})
                    }}>
                {isVA.value==='call'&&call()}
                <Paper className="topbar" ref={topbarRef} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
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
                <video id="videoChat" autoPlay style={{transform:mediaType===0?' rotateY(180deg)':''}}></video>
                <div className="option" ref={optRef} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
                    {selectButton()}
                    <ButtonBase className='closeBtn' onClick={close} elevation={7}>
                        <CallEnd style={{color:'#fff',width:'30px',height:'30px'}}  />
                    </ButtonBase>
                    <ButtonBase className="muteBtn">
                        <Mic style={{color:'#fff'}}/>
                    </ButtonBase>
                </div>
                {
                    isnarrow&&
                    <Paper id="selfView" style={{margin:0}} onMouseMove={(e)=>{
                        let coordinate=elementMove('#VAChat','#selfView',mouseCoord,e);
                        if(coordinate) setMouseCoord(coordinate);
                    }}>
                        <video id="selfVideo" autoPlay style={{transform:mediaType===0?' rotateY(180deg)':''}}></video>
                        <IconButton style={{position:'absolute',bottom:0,right:0}} onClick={(e)=>{
                            document.getElementById('selfVideo').srcObject=document.getElementById('videoChat').srcObject;
                        }}> 
                            <SwapVert  />
                        </IconButton>
                    </Paper>
                }
            </Paper>
            </Slide>
        </React.Fragment>
    )
}
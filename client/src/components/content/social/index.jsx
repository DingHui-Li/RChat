import React, { useEffect } from 'react'
import {Grid,Avatar,Fab,Slide, withWidth,IconButton} from '@material-ui/core'
import {InsertEmoticon,Close,ArrowUpward,ArrowBack} from '@material-ui/icons'
import {useApp} from '../../../context/appContext'
import './css/index.css'
import {imgHost,apiHost} from '../../../config'
import Write from './write'
import {axiosInstance as Axios} from '../../../index'
import {useSnackbar} from 'notistack'
import OneThink from './oneThink'
import MyHome from './myHome'
import {useGlobal} from '../../../context/globalContext'
import {debounce} from 'lodash'
import {parseImgInfo} from '../../../util/imgUtil'

function Social(props){
    const {userInfo}=useGlobal();
    const {enqueueSnackbar}=useSnackbar();
    const {openUI,updateOpenUI} =useApp();

    const contentRef=React.createRef();
    const [publishImg,setPublishImg]=React.useState([]);//待发布的图片--已上传但未发布
    useEffect(()=>{
        window.imgs=publishImg;
    },[publishImg])

    const [fabAction,setFabAction]=React.useState('publish');//fab--action(icon)
    const [selectedUser,setSelectedUser]=React.useState(null);//选择用户进入主页
    const [thinksData,setThinksData]=React.useState([]);
    useEffect(()=>{
        // if(props.width==='xs'){
        //     document.getElementById('social').requestFullscreen().catch(err=>{console.log(err)});
        // }
        Axios({
            method:'get',
            url:apiHost+'/think/get'
        }).then(res=>{
            if(res.data.code===200){
                setThinksData(res.data.data)
            }else{
                enqueueSnackbar('服务器错误',{variant:'error'});
            }
        }).catch(err=>{
            enqueueSnackbar('发生未知错误',{variant:'error'})
        })
        return ()=>{//组件卸载时删除掉已上传但未发布的图片
            if(!window.imgs||window.imgs.length===0) return;
            Axios({
                method:'post',
                url:apiHost+'/upload/delete',
                data:{'imgs':window.imgs}
            }).then(res=>{
                console.log(res)
            })
        }
    },[]);
    

    function deleteCallback(id){
        let temp=thinksData.slice();
        for(let i=0;i<temp.length;i++){
            if(temp[i]._id===id){
                temp.splice(i,1);break;
            }
        }
        setThinksData(temp);
    }
    function publishCallback(data){
        setFabAction('publish');
        let temp=thinksData.slice();
        temp.unshift(data);
        setThinksData(temp);
    }
    function handleFab(){
        if(fabAction==='publish'){
            setFabAction('close')
        }else if(fabAction==='close'||fabAction==='myHome'){
            setSelectedUser(null);
            setFabAction('publish')
        }else if(fabAction==='scrollTop'){
            contentRef.current.scrollTop=0;
        }
    }
    function handleScroll(){
        if(!contentRef.current) return;
        let scrollTop=contentRef.current.scrollTop;
        if(scrollTop>500){
            setFabAction('scrollTop');
        }
        else{
            setFabAction('publish');
        }
    }

    let info=parseImgInfo(userInfo.cover);
    return(
        <Grid item xs={12} container justify="center" id="social">
            <Grid item xs={12} md={10} lg={8} xl={6} className='container'>
                <div className="content" ref={contentRef} onScrollCapture={debounce(handleScroll,500)}>
                    {
                        props.width==='xs'&&
                        <IconButton className="backBtn" onClick={()=>updateOpenUI(null)}><ArrowBack className="icon"/></IconButton>
                    }
                    {
                        props.width!=='xs'&&
                        <div className="userInfo"onClick={()=>{setFabAction('myHome');setSelectedUser(userInfo)}} style={{backgroundColor:info.color}}> 
                            <img src={imgHost+userInfo.cover} className="cover"/>
                            <Avatar src={imgHost+userInfo.avatar} className="avatar"></Avatar>
                        </div>
                    }
                    {
                        <div className="thinks">
                        {
                            thinksData.map((item)=>(
                                <OneThink key={item._id} 
                                        data={item} 
                                        width={props.width}
                                        isMe={userInfo._id===item.user._id}
                                        deleteSuccess={deleteCallback}
                                        enterHome={(user)=>{setFabAction('myHome');setSelectedUser(user)}}/>
                                ))
                        }
                        </div>
                    }
                </div>
                <Slide in={fabAction==='close'} direction='left' timeout={400} >
                    <div className="write">
                        <Write userInfo={userInfo} publishSuccess={publishCallback} images={publishImg} setImages={setPublishImg} />
                    </div>
                </Slide>
                <Slide in={fabAction==='myHome'} direction='left'>
                    <div className="myHome">
                        {
                            selectedUser&&
                            <MyHome user={selectedUser} isMe={selectedUser._id===userInfo._id} width={props.width}/>
                        }
                        
                    </div>
                </Slide>
                <Fab color="primary" className='fab' onClick={handleFab}>
                    {
                        (fabAction==='myHome'||fabAction==="close")&&<Close className="icon" />
                    }
                    {
                        fabAction==='publish'&&<InsertEmoticon className="icon" />
                    }
                    {
                        fabAction==="scrollTop"&&<ArrowUpward className="icon" />
                    }
                </Fab>
            </Grid>
        </Grid>
    )
}
export default withWidth()(Social)
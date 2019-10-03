import React, { useEffect } from 'react'
import {Grid,Fab,TextField,Switch,Slide,Paper,Button,Avatar,Checkbox,Chip,LinearProgress,CircularProgress,Fade, IconButton} from '@material-ui/core'
import {Send,Public,VpnLock,Notifications,NavigateNext,Add,Close} from '@material-ui/icons'
import {useApp} from '../../../context/appContext'
import './css/write.css'
import {imgHost, apiHost} from '../../../config'
import {axiosInstance as Axios} from '../../../index'
import {useSnackbar} from 'notistack'
import getImgInfo,{compress,parseImgInfo} from '../../../util/imgUtil'
import Zmage from 'react-zmage'
export default function Write(props){

    const{enqueueSnackbar}=useSnackbar();
    const {friendsList_data}=useApp();
    const [isSelectFriend,setIsSelectFriend]=React.useState(false);//是否选择朋友页面

    const initData=friendsList_data.map(item=>({'id':item._id,'checked':false,'avatar':item.avatar,'name':item.name}));
    const [checkboxs,updateCheckboxs]=React.useState(initData);

    let count=checkboxs.filter(item=>item.checked).length;
    const [keyword,setKeyword]=React.useState('');//选择朋友--过滤关键字
    const inputFileRef=React.createRef();
    const [loadingImg,setLoadingImg]=React.useState(false);
    const [loading,setLoading]=React.useState(false);
    const [deleteArea,setDeleteArea]=React.useState(false);//显示删除区域

    const [text,setText]=React.useState('');//内容
    const [isPublic,setIsPublic]=React.useState(true);//是否公开
    const {images,setImages}=props;


    function handleCheckChange(id){//处理选择朋友变化
        let temp=checkboxs.slice();
        for(let i=0;i<temp.length;i++){
            if(temp[i].id===id){
                temp[i].checked=!temp[i].checked;
                break;
            }
        }
        updateCheckboxs(temp);
    }
    function check(id){//根据用户id查询是否选中
        for(let i=0;i<checkboxs.length;i++){
            if(checkboxs[i].id===id){
                return checkboxs[i].checked;
            }
        }
        return false;
    }
    function handlePublish(){//发布事件
        setLoading(true);
        let friends=checkboxs.filter(item=>item.checked).map(item=>item.id);
        Axios({
            method:'post',
            url:apiHost+'/think/publish',
            data:{
                content:text,
                isPublic:isPublic,
                imgs:images,
                remind:friends
            }
        }).then(res=>{
            setLoading(false);
            if(res.data.code===200){
                setText('');
                setImages([]);
                updateCheckboxs(initData);
                setIsPublic(true);
                res.data.data.user=props.userInfo;
                props.publishSuccess(res.data.data);
                enqueueSnackbar('发布成功',{variant:'success'});
            }
            else{
                enqueueSnackbar('发布失败',{variant:'error'});
            }
        }).catch(err=>{
            setLoading(false);
            enqueueSnackbar('发生未知错误:'+err,{variant:'error'});
        })
    }
    async function  handleUploadImg(e) {
        e.persist();
        setLoadingImg(true);
        let files=e.target.files;
        if(files.length>9||images.length>9||images.length+files.length>9){
            setLoadingImg(false);
            return enqueueSnackbar('最多添加9张图片!',{variant:'error'});
        }
        let formData=new FormData();
        let infos=[];
        for(let i=0;i<files.length;i++){
            let d=await compress(files[i]);
            let info=await getImgInfo(d);
            infos.push(info)
            formData.append('images',d);
            
        }
        formData.append('infos',JSON.stringify(infos))
        Axios({
            method:'post',
            url:apiHost+'/upload/images',
            data:formData
        }).then(res=>{
            setLoadingImg(false);
            if(res.data.code===200){
                let imgs=images.concat(res.data.paths);
                setImages(imgs);
            }else{
                enqueueSnackbar('图片上传错误',{variant:'error'})
            }
        }).catch(err=>{
            setLoadingImg(false);
            enqueueSnackbar('发生错误：'+err,{variant:'error'})
        })
        if(e.target) e.target.value='';
    }
    function handleDrop(e) {
        e.persist();
        e.target.innerHTML="删除中";
        let path=e.dataTransfer.getData('path');
        deleteImg(path);
        e.target.innerHTML="拖动到此处删除";
    }
    function deleteImg(path) {
        Axios({
            method:'post',
            url:apiHost+'/upload/delete',
            data:{'imgs':path}
        }).then(res=>{
            if(res.data.code===200){
                enqueueSnackbar('删除成功',{variant:'success'});
                let temp=images.slice();
                for(let i=0;i<temp.length;i++){
                    if(temp[i]===path){
                        temp.splice(i,1);
                    }
                }
                setImages(temp);
            }else{
                enqueueSnackbar('删除失败',{variant:'error'})
            }
        }).catch(err=>{
            enqueueSnackbar('发生错误：'+err,{variant:'error'})
        })
    }
    function handleChangeImg(e,path) {
        let temp=images.slice();
        let changePath=e.dataTransfer.getData('path');
        let index1=-1;
        let index2=-1;
        for(let i=0;i<temp.length;i++){
            if(temp[i]===path){
                index1=i;
            }if(temp[i]===changePath){
                index2=i;
            }
        }
        temp[index1]=changePath;
        temp[index2]=path;
        setImages(temp);
    }

    function createStyle(path,height) {
        let info=parseImgInfo(path)
        if(info.w>=info.h){
            return {
                img:{width:'auto',height:'100%'},
                box:{backgroundColor:info.color,height}
            }
        }else{
            return {
                img:{width:'100%',height:'auto'},
                box:{backgroundColor:info.color,height}
            }
        }
    }
    function img() {
        let height=parseInt(document.querySelector('#write .picture').clientWidth/3);
        let placeholderEle=document.getElementById('imgPlaceholder');
        if(placeholderEle){
            placeholderEle.style.width=height+'px';
            placeholderEle.style.height=height+'px';
        }
        return (
            <React.Fragment>
            {
                images.map(path=>{
                    let style=createStyle(path,height);
                    return (
                        <Grid item xs={4}  className='placeholder' key={path} style={style.box} draggable 
                            onDragOver={(e)=>e.preventDefault()}
                            onDrop={(e)=>handleChangeImg(e,path)}
                            onDragStart={(e)=>{setDeleteArea(true);e.dataTransfer.setData('path',path)}}
                            onDragEnd={()=>setDeleteArea(false)}>
                            <IconButton className="deleteBtn" onClick={()=>deleteImg(path)}><Close className="icon" /></IconButton>
                            <Zmage src={imgHost+path} style={style.img} draggable={false}/>
                        </Grid>
                    )
                })
            }
            </React.Fragment>
        )
    }
    return (
        <div id="write">
            <TextField fullWidth={true} 
                        variant='outlined' 
                        multiline={true} 
                        rows='15'
                        onChange={(e)=>{setText(e.target.value)}} 
                        autoFocus
                        value={text}
                        placeholder="...🙃"
                        className="input"/>
            <Grid className="picture" container item xs={12}>
                {loadingImg&&<LinearProgress className="loadingImg"/>}
                {images.length>0 && img()}
                {
                    (images.length<9&&!loading&&!loadingImg)&&
                    <div className="placeholder" id="imgPlaceholder" onClick={()=>{if(loadingImg||loading) return;inputFileRef.current.click()}}>
                        <Add className="icon" />
                        <input type="file" accept="image/*" multiple ref={inputFileRef} onChange={handleUploadImg} style={{display:'none'}}/>
                    </div>
                }
                
            </Grid>
            <div className="item">
                {
                    isPublic?
                    <Public className="icon" />
                    :
                    <VpnLock className="icon" />
                }
                <span className="text">
                {
                    isPublic?'公开':'私密'
                }
                </span>
                <Switch className="opt" color="primary" checked={isPublic} onChange={()=>{setIsPublic(!isPublic)}}/>
            </div>
            <div className="item expand" onClick={()=>{setIsSelectFriend(!isSelectFriend)}}>
                <Notifications className="icon" />
                <span className="text">提醒谁看</span>
                <NavigateNext className="expandIcon" />
                <div className="selected">
                    {
                        checkboxs.filter(item=>item.checked).map(item=>(
                            <Chip className="chip" avatar={<Avatar src={imgHost+item.avatar}/>}  key={'selected'+item.id} label={item.name.substr(0,5)} onDelete={()=>handleCheckChange(item.id)} />
                        ))
                    }
                </div>
            </div>
            <Fade in={deleteArea} timeout={500}>
                <div className="deleteArea" onDrop={(e)=>{ console.log(e)}} 
                    onDragOver={(e)=>e.preventDefault()}
                    onDrop={handleDrop}
                    onDragEnter={(e)=>{console.log(e.dataTransfer.getData('path'));e.currentTarget.style.cssText=" box-shadow:5px 10px 10px #cccccc;border-radius:10px;width:95%;margin-top:10px;";e.target.innerHTML="松开以删除"}}
                    onDragLeave={(e)=>{e.currentTarget.style.cssText=" box-shadow:none;border-radius:none;width:100%;margin-top:0";e.target.innerHTML="拖动到此处删除"}}>
                        拖动到此处删除
                </div>
            </Fade>
            <Fab className='fab' disabled={(text.trim().length===0&&images.length===0)||loading||loadingImg} onClick={handlePublish}>
                <Send className="icon"/>
                {
                    loading &&<CircularProgress className="loading" size={60} />
                }
            </Fab>
            <Slide in={isSelectFriend} direction='left'>
                <div className="selectFriend">
                    <div className="topBar">
                        <Button variant="outlined" onClick={()=>{setIsSelectFriend(false);updateCheckboxs(initData)}}>
                            取消
                        </Button>
                        <Button className="btn" variant="outlined" onClick={()=>setIsSelectFriend(false)}>
                            确定{
                                count>0&&
                                <span>({count}/10)</span>
                            }
                        </Button>
                    </div>
                    <TextField className="filter" placeholder="搜索" onChange={(e)=>setKeyword(e.target.value)} />
                    <Paper className="selectedContainer">
                        {
                            checkboxs.filter(item=>item.checked).map(item=>(
                                <Chip className="chip" avatar={<Avatar src={imgHost+item.avatar}/>}  key={'selected'+item.id} label={item.name.substr(0,5)} onDelete={()=>handleCheckChange(item.id)} />
                            ))
                        }
                    </Paper>
                    {
                        friendsList_data.filter(item=>(item.name.indexOf(keyword)!==-1)).map((item)=>(
                            <div className="friend" key={item._id} style={{backgroundColor:check(item._id)?'rgba(0,0,0,.1)':'#fff'}} 
                                onClick={()=>{handleCheckChange(item._id)}}>
                                <Avatar className="avatar" src={imgHost+item.avatar}></Avatar>
                                <span className="name">{item.name}</span>
                                <Checkbox className="checkbox" checked={check(item._id)} color="primary"/>
                            </div>
                        ))
                    }
                </div>
            </Slide>
        </div>
    )
}
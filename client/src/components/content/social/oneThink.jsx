import React, { useEffect } from 'react'
import {Grid,Avatar,Card,CardHeader,CardContent,CardActions,IconButton,TextField,Popper,Grow,Paper} from '@material-ui/core'
import {FavoriteBorder,Favorite,Share,ModeComment,DeleteForever,Close,Check} from '@material-ui/icons'
import './css/oneThink.css'
import 'animate.css'
import {imgHost,apiHost} from '../../../config'
import {timeParse} from '../../../util/timeUtil'
import {axiosInstance as Axios} from '../../../index'
import {useSnackbar} from 'notistack'
import {parseImgInfo} from '../../../util/imgUtil'
import Zmage from 'react-zmage'
export default function OneThink(props){
    const [deleteAnchor,setDeleteAnchor]=React.useState(null);
    const {enqueueSnackbar}=useSnackbar();

    const [defaultPage,setDefaultPage]=React.useState(0);//zmage-默认页
    const [set,settingSet]=React.useState([]);//zmage-set
    const [imgStyle,setImgStyle]=React.useState([]);
    useEffect(()=>{
        let temp=props.data.imgs.map(img=>(
            {src:imgHost+img}
        ));
        settingSet(temp);
        let num=3;//每一行的图片数
        if(props.data.imgs.length<3){//若图片数小于3
            num=props.data.imgs.length;
        }
        let height=parseInt((document.querySelector('#oneThink .images').clientWidth-60)/num);//每一个图片的高度
        let style=props.data.imgs.map(path=>createStyle(path,height,num))
        setImgStyle(style);
    },[]);

    function createStyle(path,height,num) {
        let info=parseImgInfo(path);
        if(info.w>=info.h){
            return {
                img:{width:'auto',height:'100%'},
                box:{backgroundColor:info.color,height},
                num
            }
        }else{
            return {
                img:{width:'100%',height:'auto'},
                box:{backgroundColor:info.color,height},
                num
            }
        }
    }
    

    function handleDelete(){
        setDeleteAnchor(null);
        Axios({
            method:'get',
            url:apiHost+'/think/delete?id='+props.data._id
        }).then(res=>{
            if(res.data.code===200){
                enqueueSnackbar('删除成功',{variant:'success'});
                props.deleteSuccess(props.data._id);
            }else{
                enqueueSnackbar("删除失败-"+res.data.msg,{variant:'error'})
            }
        }).catch(err=>{
            enqueueSnackbar('发生未知错误',{variant:'error'});
        })
    }
    function imgs() {
        return (
            <React.Fragment>
            {
                imgStyle.length>0&&
                props.data.imgs.map((path,index)=>{
                    return (
                        <Grid xs={12/imgStyle[index].num} item className='placeholder' key={path} style={imgStyle[index].box}>
                            <Zmage src={imgHost+path}
                                style={imgStyle[index].img} set={set} defaultPage={defaultPage} 
                                onClick={()=>setDefaultPage(index)}/>
                        </Grid>
                    )
                })
            }
            </React.Fragment>
        )
    }
    return(
        <Card id="oneThink" elevation={0} className="animated  fadeInUp">
            <CardHeader avatar={<Avatar src={imgHost+props.data.user.avatar} 
                        onClick={()=>{if(props.enterHome)props.enterHome(props.data.user)}}></Avatar>} 
                        className="header"
                        title={props.data.user.name} 
                        subheader={timeParse(props.data.time)} 
                        action={props.isMe&&<IconButton onClick={(e)=>{setDeleteAnchor(e.target)}}><DeleteForever /></IconButton>} />
            <CardContent style={{paddingBottom:0}}>
                {
                    props.data.content.length>0&&
                    <TextField className='content' fullWidth={true} 
                        variant='outlined' 
                        multiline={true} 
                        value={props.data.content}
                        disabled/>
                }
                <Grid container item xs={12} className='images'>
                    {imgs()}
                </Grid>  
            </CardContent>
            <CardActions style={{paddingTop:0}}>
                <IconButton style={{marginLeft:'55px'}}><FavoriteBorder/></IconButton>
                <IconButton><Share/></IconButton>
                <IconButton style={{marginLeft:'auto'}}><ModeComment/></IconButton>
            </CardActions>

            <Popper open={Boolean(deleteAnchor)} anchorEl={deleteAnchor} transition>
                    {
                        ({TransitionProps})=>(
                            <Grow {...TransitionProps}>
                                <Paper id="deleteThinkConfirm" elevation={10}>
                                    <div className="arrow"></div>
                                    <div className="text">确认删除？此操作不可撤销！</div> 
                                    <div className="action">
                                        <IconButton className="cancelBtn" onClick={()=>setDeleteAnchor(null)}>
                                            <Close className="icon" />
                                        </IconButton>
                                        <IconButton className="confirmBtn" onClick={()=>{handleDelete()}}>
                                            <Check className="icon" />
                                        </IconButton>
                                    </div>
                                </Paper>
                            </Grow>
                        )
                    }
            </Popper>
        </Card>
    )
}
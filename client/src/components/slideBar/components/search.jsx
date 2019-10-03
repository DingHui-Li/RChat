import React from 'react'
import {Search as SearchIcon,Room} from '@material-ui/icons'
import {Paper,Avatar,InputBase,IconButton, Popper,Slide,Button,LinearProgress,ClickAwayListener} from '@material-ui/core'
import {debounce} from 'lodash'
import '../css/search.css'
import {axiosInstance as Axios} from '../../../index'
import {imgHost,apiHost} from '../../../config'
import {useSnackbar} from 'notistack'
import {useApp} from '../../../context/appContext'

export default function Search(){
    const {enqueueSnackbar}=useSnackbar();
    const {update_friendsListSelected}=useApp();

    const [searchAnchor,setSearchAnchor]=React.useState(null);//搜索结果弹窗锚点
    const [searchResultData,setSearchResult]=React.useState(null);//搜索结果

    function handleSearch(){
        let ele=document.querySelector('#search .searchBox');
        let input=document.getElementById('searchInput')
        if(input.value.trim().length>0){
            setSearchAnchor(ele);
            setSearchResult(null);
            Axios({
                method:'get',
                url:apiHost+'/user/search?keyword='+input.value.trim()
            }).then(res=>{
                if(res.data.code===200){
                    setSearchResult(res.data.data);
                }else{
                    enqueueSnackbar('服务器错误',{variant:'error'});
                }
            }).catch(err=>{
                enqueueSnackbar('网络错误',{variant:'error'});
            })
        }
        else setSearchAnchor(null);
    } 

    function searchBox(){
        return(
            <div id="search">
                <ClickAwayListener onClickAway={()=>setSearchAnchor(null)}>
                    <Paper className="searchBox" elevation={1}>
                        <div style={{minWidth:'10%',maxWidth:'20%',float:'left',textAlign:'center'}}>
                            <IconButton onClick={debounce(handleSearch,500)} >
                                <SearchIcon />
                            </IconButton>
                        </div>
                        <InputBase id="searchInput" style={{width:'80%'}} onChange={debounce(handleSearch,1000)}/>
                    </Paper>
                </ClickAwayListener>
            </div>
        )
    }
    function searchResult(){
        let ele=document.querySelector('#search .searchBox');
        let width=200;
        if(ele) width=ele.clientWidth-30;
        return (
            <Popper anchorEl={searchAnchor} open={Boolean(searchAnchor)} transition>
                {
                    ({TransitionProps})=>(
                        <Slide  {...TransitionProps} direction="right">
                            <Paper className="searchResult" elevation={10} style={{width:width+'px'}}>
                                {
                                    searchResultData===null&&
                                    <LinearProgress  />
                                }
                                {
                                    Array.isArray(searchResultData)&&searchResultData.length>0?
                                    searchResultData.map(item=>(
                                        <div className="item" key={item._id} onClick={()=>update_friendsListSelected(item)}>
                                            <Avatar src={imgHost+item.avatar} className="avatar"></Avatar>
                                            <div className="other">
                                                <div style={{padding:'0 3px'}}>
                                                    <span className="name">{item.name}</span>
                                                    <img src={item.sex==='male'?require("../../../asset/male.png"):require("../../../asset/female.png")}  className="icon" />
                                                </div>
                                                <div style={{padding:0}}>
                                                    <Room className="icon"/>
                                                </div>
                                            </div>
                                            <Button className="btn" variant="outlined" color="primary" onClick={()=>update_friendsListSelected(item)}>查看</Button>
                                        </div>
                                    ))
                                    :
                                    <div className="item" style={{textAlign:'center'}}>
                                        <span className="tipText">无结果</span> 
                                    </div>
                                }
                            </Paper>
                        </Slide >
                    )
                }
            </Popper>
        )
    }
    return(
        <React.Fragment>
            {searchBox()}
            {searchResult()}
        </React.Fragment>
    )
}
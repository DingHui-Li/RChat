import React, { useEffect } from 'react'

const appContext =React.createContext();

export default function AppContext(props){
    const [VAState,update_VAState]=React.useState('false');//接听状态

    const [chatList_data,update_chatListData]=React.useState([]);//聊天列表
    const [chatList_selected,update_chatListSelected]=React.useState(-1);//选择的聊天列表一项
    useEffect(()=>{
        if(chatList_selected!==-1){
            update_friendsListSelected(-1);
            updateOpenUI(null);
        }
    },[chatList_selected])

    const [friendsList_data, update_friendsList]=React.useState([]);//好友列表
    const [friendsList_selected,update_friendsListSelected]=React.useState(-1);//选择的好友列表一项
    useEffect(()=>{
        if(friendsList_selected!==-1){
            update_chatListSelected(-1);
            updateOpenUI(null);
        }
    },[friendsList_selected])

    const [msgData,setMsgData]=React.useState([]);//与某一用户的聊天数据
    const [newMsgData,setNewMsgData]=React.useState(null);//接收到的最新一条消息
    useEffect(()=>{
        if(newMsgData){
            let temp=msgData.slice();
            temp.push(newMsgData);
            setMsgData(temp);
        }
    
    },[newMsgData]);

    const [isLine,setLine]=React.useState(false);//在线状态

    const [applyList,updateApplyList]=React.useState([]);//好友申请列表

    const [openUI,updateOpenUI]=React.useState(null);//右侧打开的界面
    useEffect(()=>{
        if(openUI!==null){
            update_chatListSelected(-1);
            update_friendsListSelected(-1);
        }
    },[openUI])


    const value={VAState,update_VAState,
                chatList_selected,update_chatListSelected,
                chatList_data,update_chatListData,
                friendsList_data, update_friendsList,
                friendsList_selected,update_friendsListSelected,
                msgData,setMsgData,
                newMsgData,setNewMsgData,
                isLine,setLine,
                applyList,updateApplyList,
                openUI,updateOpenUI}
    return (
        <appContext.Provider value={value}>
            {props.children}
        </appContext.Provider>
    )
}

export function useApp(){
    return React.useContext(appContext)
}
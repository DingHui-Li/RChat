import React, { useEffect } from 'react'

const appContext =React.createContext();

export default function AppContext(props){
    const [VAState,update_VAState]=React.useState('false');

    const [chatList_data,update_chatListData]=React.useState([]);
    const [chatList_selected,update_chatListSelected]=React.useState(-1);
    useEffect(()=>{
        if(chatList_selected!==-1){
            update_friendsListSelected(-1);
        }
    },[chatList_selected])

    const [friendsList_data, update_friendsList]=React.useState([]);
    const [friendsList_selected,update_friendsListSelected]=React.useState(-1);
    useEffect(()=>{
        if(friendsList_selected!==-1){
            update_chatListSelected(-1);
        }
    },[friendsList_selected])

    const [msgData,setMsgData]=React.useState([]);
    const [newMsgData,setNewMsgData]=React.useState(null);
    useEffect(()=>{
        if(newMsgData){
            let temp=msgData.slice();
            temp.push(newMsgData);
            setMsgData(temp);
        }
    
    },[newMsgData])

    const value={VAState,update_VAState,
                chatList_selected,update_chatListSelected,
                chatList_data,update_chatListData,
                friendsList_data, update_friendsList,
                friendsList_selected,update_friendsListSelected,
                msgData,setMsgData,
                newMsgData,setNewMsgData}
    return (
        <appContext.Provider value={value}>
            {props.children}
        </appContext.Provider>
    )
}

export function useApp(){
    return React.useContext(appContext)
}
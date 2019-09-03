export function getFriendData(friends,id){
    for(let i=0;i<friends.length;i++){
        if(friends[i]._id===id){
            return friends[i];
        }
    }
    return "";
}

export function updateChatList(arr,newData){
    let exist=false;
    let index=-1;
    for(let i=0;i<arr.length;i++){
        if(arr[i].userid===newData.userid&&arr[i].friendid[0]._id===newData.friendid[0]._id){
            index=i;
            exist=true;
            break;
        }
    }
    if(exist){
        arr.splice(index,1);
        arr.unshift(newData);
    }else{
        arr.unshift(newData);
    }
    return arr;
}

export function findIndex(arr,field,value){
    for(let i=0;i<arr.length;i++){
        if(arr[i][field]===value){//对象解构
            return i;
        }
    }
    return -1;
}
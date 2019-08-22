export function getFriendData(friends,id){
    for(let i=0;i<friends.length;i++){
        if(friends[i]._id===id){
            return friends[i];
        }
    }
    return "";
}
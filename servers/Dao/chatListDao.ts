export default class chatListDao{
    ChatList=require('../schema/chatListSchema');
    constructor(){}
    getChatList(user:String){
        this.ChatList.find({'user':user})
                    .populate({path:'friend',select:['_id','avatar','name']})
                    .populate({path:'latelyChat',select:['chat']})
                    .sort({'time':1})
                    .exec(function(err:any,chatList:any){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(chatList);
                        }

                    })
    }

    addChatList(){

    }
}
function filter(url:string,res:any):boolean{//若是以下url则返回false，反之返回true
    let routerList:string[]=[
        '/user',
        '/images',
        // '/chat'
    ];
    for(let i=0;i<routerList.length;i++){
        if(url.indexOf(routerList[i])!=-1){
            return false;
        }
    }
    return true;
}
module.exports=filter;
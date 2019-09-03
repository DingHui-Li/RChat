
export function scrollDown(elementID){
    let ele=document.getElementById(elementID);
    let scrollHeight=ele.scrollHeight;
    ele.scrollTop=scrollHeight;
}

export function isScrollTop(elementID){
    let ele=document.getElementById(elementID);
    if(ele.scrollTop===0){
        return true;
    }else{
        return false;
    }
}
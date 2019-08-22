
export function scrollDown(elementID){
    let ele=document.getElementById(elementID);
    let scrollHeight=ele.scrollHeight;
     ele.scrollTop=scrollHeight;
}
export default function elMove(parent,self,mouseCoord,e){
    if(e.buttons===1){
        e.stopPropagation();
        let ele=document.querySelector(self);
        let left=parseInt(ele.style.marginLeft);
        let top=parseInt(ele.style.marginTop);
        let width=ele.offsetWidth;
        let height=ele.offsetHeight;

        let windowWidth=window.innerWidth;
        let windowHeight=window.innerHeight;

        let leftEdge=0;
        let rightEdge=windowWidth;
        let topEdge=0;
        let bottomEdge=windowHeight;
        if(parent!==''){//计算四边的边界
            let parentEle=document.querySelector(parent);
            let left=parseInt(parentEle.style.marginLeft);
            let width=parentEle.offsetWidth;
            let top=parseInt(parentEle.style.marginTop);
            let height=parentEle.offsetHeight;
            leftEdge=left<0?0:left;
            rightEdge=left+width;
            rightEdge=rightEdge>windowWidth?windowWidth:rightEdge;
            topEdge=top<0?0:top;
            bottomEdge=top+height;
            bottomEdge=bottomEdge>windowHeight?windowHeight:bottomEdge;
        }
        
        let distanceX=e.clientX-mouseCoord.x;
        let distanceY=e.clientY-mouseCoord.y;
        let marginLeft=left+distanceX;
        if(marginLeft>=leftEdge&&marginLeft+width<=rightEdge){
             ele.style.marginLeft=marginLeft+'px';
        }
        let marginTop=top+distanceY;
        if(marginTop>=topEdge&&marginTop+height<=bottomEdge){
              ele.style.marginTop=marginTop+'px';
        }
        return {'x':e.clientX,'y':e.clientY}
    }
    return false;
}
import React, { useEffect } from 'react'
import { getThemeProps } from '@material-ui/styles';

const globalContext=React.createContext();
export default function GlobalContext(props) {
    let info=""; 
    if(localStorage['userInfo']!=undefined){
        info=JSON.parse(localStorage['userInfo']); 
    } 
    const [userInfo,updateUserInfo]=React.useState(info);
    useEffect(()=>{
        localStorage['userInfo']=JSON.stringify(userInfo);
    },[userInfo])
    return (
        <globalContext.Provider value={{userInfo,updateUserInfo}}>
            {props.children}
        </globalContext.Provider>
    )
}
export function useGlobal() {
    return React.useContext(globalContext);
}
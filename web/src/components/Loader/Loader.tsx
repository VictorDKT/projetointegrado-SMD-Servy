import { useState } from "react";
import {FadeLoader} from "react-spinners"

export let openLoader: ()=>void;
export let closeLoader: ()=>void;

export function Loader() {
    const [loader, setLoader] = useState(0);

    openLoader = ()=>{
        const newLoader = loader;
        setLoader(newLoader+1)
    }

    closeLoader = ()=>{
        const newLoader = loader;
        setLoader(newLoader-1)
    }

    return (
        <div 
            className="save-modal-blur"
            style={{
                display: loader > 0 ? "flex" : "none",
                zIndex: 20,
            }}
        >
            <FadeLoader color={"#FE9715"} loading={true} height={15} width={5} />
        </div>
    )
}
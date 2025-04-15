import { Icon } from "@iconify/react/dist/iconify.js";
import IosToggle from "./iosToggle";

const LeftBar = () => {

	return (
		
		<div  
            id="LeftBar"
            >
                 <div className="mt-2">
                    <button className="">
                        <div className="d-flex align-items-center justify-content-center">
                             <Icon icon="fluent:circle-12-regular" 
                                width="36" 
                                height="36" 
                                style={{ color: 'white' }}
                                />
                        </div>
                    </button>
                </div>                
        </div>
        )
    };

export default LeftBar;

import React from "react";
import partStore from "./../../store/partStore";
import { observer } from "mobx-react-lite";

const HighLighted = observer(() => {
    const { highLighted } = partStore;

    if (typeof highLighted !== "number") {
        return null;
    }

    const pathData = partStore.getElementByCidAndClass(highLighted, "contour", "path") || "";

    return (
        <>
            <path 
                className="highLighted" 
                id="highLighted"
                d={pathData} 
            />
        </>
    );
});

export default HighLighted;
import {useState} from "react";
import Image from "next/image";
import {loaderIcon} from "@helpers/Icons";
import {DEFAULT_IMAGE_URL} from "@constants/Common";
import colors from "@constants/Colors";

const FrontImage = ({src,alt,onError,fallbackSrc,...rest}) => {
    const [isLoading,setIsLoading] = useState(true);
    const defaultAttributes = {};
    const mergedAttributes = {...defaultAttributes,...rest};
    const [error,setError] = useState(false);
    const handleImageError = (e) => {
        setError(true);
        onError && onError(e);
    };
    const handleImageLoad = () => {
        setIsLoading(false)
    }
    return (
        <>
            {isLoading && <div className="loading-image">{loaderIcon({width:30,height:30,stroke:colors.BLACK})}</div>}
            {error ? (
                <Image src={DEFAULT_IMAGE_URL} alt={alt} {...mergedAttributes} onLoad={handleImageLoad}/>
            ) : (
                <Image src={src} alt={alt} {...mergedAttributes} onError={handleImageError} onLoad={handleImageLoad}/>
            )}
        </>
    );
};
export default FrontImage;
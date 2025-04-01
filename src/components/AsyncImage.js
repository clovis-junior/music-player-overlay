import { useEffect, useState } from 'react';

function AsyncImage(props) {
    const {animation, ...inline} = props;
    const [loaded, setLoaded] = useState(null);

    useEffect(()=>{
        if(props.src) {
            async function handleLoad() {
                setLoaded(props.src)
            }

            const image = new Image();
            image.addEventListener('load', handleLoad);
            image.src= props.src;
            return ()=> image.removeEventListener('load', handleLoad)
        }
    }, [props.src]);

    if(loaded === props.src) {
        if(animation) {
            var classAnimation;
            setTimeout(function(){
                classAnimation = ''
            }, 300)
        }

        return (
            <img className={classAnimation || ''} {...inline} alt={props.alt || ''} />
        )
    }

    return null
}

export default AsyncImage;
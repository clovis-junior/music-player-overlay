import { RequestToken } from '../Platforms/YouTubeMusic';

export default function Home() {
    return (
        <>
            <button onClick={()=> RequestToken()}>Auth</button>
        </>
    )
}
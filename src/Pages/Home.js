import { RequestToken } from '../platforms/YouTubeMusic';

export default function Home() {
    return (
        <>
            <button onClick={()=> RequestToken()}>Auth</button>
        </>
    )
}
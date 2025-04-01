import { useState } from 'react';
import Auth from './Auth';
import '../scss/configure.scss';

export default function Home() {
    const [selected, setSelected] = useState(null);

    function choosePlatform(name) {
        setSelected(name)
    }

    function Choose() {
        return (
            <div className='container'>
                <div className='middle'>
                    <div className='panel'>
                        <div className='panel_content'>
                            <p>Please, choose the platform for create the overlay.</p>
                        </div>
                        <navbar className='btns column'>
                            <button type='button' className='btn ytm' onClick={()=> choosePlatform('youtube')}>YouTube Music</button>
                            <button type='button' className='btn apple' onClick={()=> choosePlatform('apple')}>Apple Music</button>
                            <button type='button' className='btn spotify' onClick={()=> choosePlatform('spotify')}>Spotify</button>
                        </navbar>
                    </div>
                </div>
            </div>
        )
    }

    return selected ? (<Auth platform={selected} />) : (<Choose />);
}
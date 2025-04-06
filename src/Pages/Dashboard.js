import { useState, useLayoutEffect } from 'react';
import Auth from './Auth';
import styles from'../scss/dashboard.module.scss';

export default function Dashboard() {
    const [selected, setSelected] = useState(null);
    const params = new URLSearchParams(window.location.search);

    useLayoutEffect(() => {
        if(!document.body.classList.contains(styles.dashboard))
            document.body.classList.add(styles.dashboard);

        window.addEventListener('popstate', function() {
            window.history.pushState(null, document.title, window.location.pathname);
            setSelected(null);
        }, false);
    });

    if(params.has('spotifyToken')) {
        if(!selected)
            choosePlatform('spotify');
    }
        
    function choosePlatform(name) {
        window.history.pushState(name, document.title);
        setSelected(name)
    }

    function Choose() {
        return (
            <div className={styles.container}>
                <div className={styles.middle}>
                    <div className={styles.panel}>
                        <div className={`${styles.panel_content} ${styles.centered}`}>
                            <h2>Welcome!</h2>
                            <p>Please, choose the platform for create the overlay.</p>
                        </div>
                        <div className={`${styles.btns} ${styles.column}`}>
                            <button type='button' className={`${styles.btn} ${styles.ytm}`} onClick={()=> choosePlatform('youtube')}>YouTube Music</button>
                            <button type='button' className={`${styles.btn} ${styles.apple}`} onClick={()=> choosePlatform('apple')}>Apple Music</button>
                            <button type='button' className={`${styles.btn} ${styles.spotify}`} onClick={()=> choosePlatform('spotify')}>Spotify</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return selected ? (<Auth platform={selected} />) : (<Choose />);
}

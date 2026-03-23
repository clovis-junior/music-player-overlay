import { useNavigate } from 'react-router-dom'
import styles from '../assets/scss/dashboard.module.scss'

function Choose() {
  const navigate = useNavigate();

  function openNewTab(url) {
    window.open(url, '_blank').focus();
  }

  return (
    <main className={styles?.panel}>
      <div className={`${styles?.panel_content} ${styles?.centered}`}>
        <h2>Welcome!</h2>
        <p>Please, choose the platform for create the overlay.</p>
        <div className={`${styles?.btns} ${styles?.column}`}>
          <button type='button' className={`${styles?.btn} ${styles?.ytm}`} onClick={()=> navigate('/platform/youtube-music')}>YouTube Music</button>
          <button type='button' className={`${styles?.btn} ${styles?.apple}`} onClick={()=> navigate('/platform/apple-music')}>Apple Music</button>
          <button type='button' className={`${styles?.btn} ${styles?.spotify}`} onClick={()=> navigate('/platform/spotify')}>Spotify</button>
        </div>
        <strong>You already choosed the platform?</strong>
        <div className={`${styles?.btns} ${styles?.column}`}>
          <button type='button' className={styles?.btn} onClick={() => navigate('/customize')}>Costumize your Player here</button>
        </div>
        <h3>Check out</h3>
        <div className={`${styles?.btns} ${styles?.column}`}>
          <button type='button' className={`${styles?.btn} ${styles?.success}`} onClick={() => openNewTab('https://ko-fi.com/clovao')}>Support Me</button>
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <div className={styles?.dashboard_page}>
      <div className={styles?.container}>
        <div className={styles?.middle}>
          <Choose />
        </div>
      </div>
    </div>
  );
}
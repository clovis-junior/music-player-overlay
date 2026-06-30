import { useState } from 'react'
import { browserURL, Success } from './Platform'

import AsyncImage from '../components/AsyncImage'
import styles from '../assets/scss/dashboard.module.scss'

import AppleMusicIcon from '../assets/images/apple-music-icon.svg'
import MarkdownContent from '../components/MarkdownContent'

function Instructions({ onGenerate }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <div className={styles?.panel_content}>
        <MarkdownContent subfolder="instructions" filename="apple-music"
          onLoad={(exists) => setIsLoaded(exists)} />
      </div>
      {isLoaded && (
        <footer className={`${styles?.btns} ${styles?.column} ${styles?.centered}`}>
          <button type="button" className={`${styles?.btn} ${styles?.apple}`} onClick={onGenerate}>Generate a Browser URL</button>
          <button type="submit" className={styles?.btn} onClick={() => window.history.back()}>Back</button>
        </footer>
      )}
    </>
  )
}

export default function AppleMusic() {
  const [generated, setGenerated] = useState(false);

  const playerURL = `${browserURL}player?platform=apple`;

  return (
    <main className={styles?.panel}>
      <figure>
        <AsyncImage className={styles?.platform_logo} src={AppleMusicIcon} alt={'Apple Music Icon'} />
      </figure>
      {generated ? (
        <Success url={playerURL} />
      ) : (
        <Instructions
          onGenerate={() => setGenerated(true)}
        />
      )}
    </main>
  )
}
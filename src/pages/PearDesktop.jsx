import { useState } from 'react'
import { browserURL, Success } from './Platform'
import { RequestToken } from '../functions/PearDesktop'

import Alert from '../components/Alert'
import AsyncImage from '../components/AsyncImage'

import styles from '../assets/scss/dashboard.module.scss'

import PearLogo from '../assets/images/ytm-logo.png'
import MarkdownContent from '../components/MarkdownContent'

function ShowAlert({ response, loading }) {
  if (loading) {
    return (
      <Alert type="info">
        <p>Connecting to Pear Desktop...</p>
        <p>Please check Pear Desktop and approve the connection prompt if it appears.</p>
      </Alert>
    );
  }

  if (response?.statusCode) {
    return (
      <Alert type="error">
        {response?.message || 'Failed to authenticate with Pear Desktop.'}
      </Alert>
    );
  }

  return null
}

function Auth({ response, setResponse }) {
  const [loading, setLoading] = useState(false);

  async function HandleConnect() {
    try {
      setLoading(true);

      const tokenResponse = await RequestToken();
      setResponse(tokenResponse)
    } catch (error) {
      setResponse({
        statusCode: 500,
        message: error?.message || 'Could not connect to Pear Desktop.'
      })
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {(response || loading) && (
        <div className={styles.panel_content}>
          <ShowAlert response={response} loading={loading} />
        </div>
      )}

      <footer className={`${styles.btns} ${styles.column} ${styles.centered}`}>
        <button
          type="button"
          className={`${styles.btn} ${styles.ytm}`}
          onClick={HandleConnect}
          disabled={loading}>
          {loading ? 'Connecting...' : 'Connect to Pear Desktop'}
        </button>

        <button
          type="button"
          className={styles.btn}
          onClick={() => window.history.back()}
          disabled={loading}>
          {loading ? 'Please wait...' : 'Back'}
        </button>
      </footer>
    </>
  )
}

function Instructions() {
  return (
    <div className={styles.panel_content}>
      <MarkdownContent subfolder="instructions" filename="pear-desktop" />
    </div>
  )
}

export default function PearDesktop() {
  const [response, setResponse] = useState(null);

  return (
    <main className={styles.panel}>
      <figure>
        <AsyncImage
          className={styles.platform_logo}
          src={PearLogo}
          alt="Pear Desktop Logo"
        />
      </figure>

      {response?.token ? (
        <Success url={`${browserURL}player?platform=pear-desktop&token=${response.token}`} />
      ) : (
        <>
          <Instructions />
          <Auth response={response} setResponse={setResponse} />
        </>
      )}
    </main>
  )
}
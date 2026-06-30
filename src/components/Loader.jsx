import styles from '../assets/scss/dashboard.module.scss'

export default function Loader({ length = 8 }) {
  const waves = [];

  for (let i = 0; i < length; i++)
    waves.push(<span key={i} className={styles?.wave} />);

  return (
    <div className={styles?.loader}>
      {waves}
    </div>
  )
}
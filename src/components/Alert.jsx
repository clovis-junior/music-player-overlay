import styles from '../assets/scss/dashboard.module.scss'

export default function Alert({ type = 'info', children }) {
    let styleClass = styles.info;

    switch (type) {
        case 'success':
            styleClass = styles.success;
            break;
        case 'error':
        case 'danger':
            styleClass = styles.error;
            break;
        case 'info':
        default:
            styleClass = styles.info;
    }

    return (
        <div className={`${styles.alert} ${styleClass}`}>
            {children}
        </div>
    );
}
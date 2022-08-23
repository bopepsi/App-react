import React from 'react'
import styles from './LoadingSpinner.module.css'

function LoadingSpinner() {
    return (
        <section className={`${styles.section}`}>
            <div class="lds-ellipsis" className={`${styles["lds-ellipsis"]}`}><div></div><div></div><div></div><div></div></div>
        </section>

    )
}

export default LoadingSpinner
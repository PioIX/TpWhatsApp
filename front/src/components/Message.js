"use client"

import styles from "./Message.module.css"
import clsx from "clsx"

export default function Message({message, isMyMessage, date}) {
    return (
        <>
            
            {/* <div className={`${styles.message} ${isMyMessage ? styles.myMessage : styles.otherMessage}`}> */}
            <div 
                className={clsx(styles.message, {
                    [styles.myMessage] : isMyMessage === true,
                    [styles.otherMessage] : isMyMessage === false
                })}>
                <div className={styles.messageContent}>
                    {message}
                </div>
                <div className={styles.messageTime}>
                    {new Date(date).toLocaleDateString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
            </div>
            
            {/* </div> */}
        </>
    )
}
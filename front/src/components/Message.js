"use client"

import styles from "./Message.module.css"

export default function Message({message, isMyMessage, userId}) {
    return (
        <>
            <div className={`${styles.message} ${isMyMessage ? styles.myMessage : styles.otherMessage}`}>
            <div className={styles.messageContent}>
                {message.content}
            </div>
            <div className={styles.messageTime}>
                {new Date(message.date).toLocaleDateString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                })}
            </div>
        </div>
        </>
    )
}
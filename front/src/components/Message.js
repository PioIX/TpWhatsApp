"use client";

import styles from "./Message.module.css";
import clsx from "clsx";

export default function Message({ message, isMyMessage, date }) {
    return (
        <div 
            className={clsx(styles.message, {
                [styles.myMessage]: isMyMessage === true,   // Si es mi mensaje, aplica la clase myMessage
                [styles.otherMessage]: isMyMessage === false // Si no es mi mensaje, aplica la clase otherMessage
            })}
        >
            <div className={styles.messageContent}>
                {message}
            </div>
            <div className={styles.messageTime}>
                {/* Formateamos la fecha en formato de hora y minuto */}
                {new Date(date).toLocaleDateString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </div>
        </div>
    );
}

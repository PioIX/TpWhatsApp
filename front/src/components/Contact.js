"use client"

import styles from "./Contact.module.css"

export default function Contact({chats}) {
    return(
        <>
            <button className={styles.contactButton}>
                <div className={styles.contactContainer}>
                    <img src={chats.photo_group || "https://imagenes2.eltiempo.com/files/image_600_455/files/fp/uploads/2025/04/01/67ec4ef31f2ce.r_d.866-866-3464.jpeg"} alt="Profile" ></img>
                    <div className={styles.contactInfo}>
                        <p className={styles.username}>{chats.chat_name}</p>
                    </div>
                </div>
            </button>
        </>
    )
}
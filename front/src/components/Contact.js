"use client"

import { useState } from "react"

export default function Contact({chats}) {
    const [lastMsg, setLastMsg] = useState()
    const [username, setUsername] = useState()

    return(
        <>
            <button>
                <div>
                    <img src={chats.group_photo} alt="Profile" ></img>
                    <div>
                        <p className="username">{chats.chat_name}</p>
                        <p className="lastMsg">{chats.last_message}</p>
                    </div>
                </div>
            </button>
        </>
    )
}
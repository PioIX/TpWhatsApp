"use client"

import { useState } from "react"

export default function Contact(props) {
    const [lastMsg, setLastMsg] = useState()
    const [username, setUsername] = useState()

    return(
        <>
            <div>
                <img></img>  
                <p className="username">{props.lastMsg}</p>
                <p className="lastMsg">{props.username}</p>
            </div>
        </>
    )
}
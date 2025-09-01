"use client"

import { useEffect, useState } from "react"

export default function ChatsPage(){
    const [chats, setChats] = useState()

    useEffect(() => {
        const fetchChats = async () => {
            try{
                const res = await fetch("/chats")
                const data = await res.json()
                setChats(data)
                console.log("Chats traidos correctamente")
            } catch(error) {
                console.log("Error al traer los chats", error)
            }
        }
        fetchChats()
    }, [])

    return (
        <>
            <h1>Chats</h1>

        </>
    )
}
"use client"

import Contact from "@/components/Contact"
import { useEffect, useState } from "react"

export default function ChatsPage(){
    const [chats, setChats] = useState([])
    const [idUser, setIdUser] = useState(1)

    useEffect(() => {
        const fetchChats = async () => {
            try{
                const res = await fetch("/http://localhost:4000/chatsUser", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({id_user: idUser})
            })
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
            <div className="chats-list">
                {chats.length === 0? (
                    <p>No tienes chats</p>
                ) : (
                    chats.map((chat) => (
                        <Contact src={chat.is_group ? chat.photo_group : chat.contact_photo} chatname={chat.is_group ? chat.chat_name : chat.contact_username} lastMsg={chat.last_message}></Contact>
                    ))
                )}
            </div>
        </>
    )
}
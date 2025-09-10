"use client";

import { useEffect, useState } from "react";

export default function ChatsPage() {
    //const [socke]
    const [chats, setChats] = useState([])

    useEffect(()=>{
        let user = localStorage.getItem("user")
        chatsUser(user)
    }, [])

    async function chatsUser(user) {
        try{
            console.log("ME llame")
            const response = await fetch("http://localhost:4000/chatsUser", {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body:JSON.stringify({user:user})
            })
            const result = await response.json()
            console.log("Respuesta del servidor:", result)
            //let chats = result.chats
            //let chats = [{chat_name: "Martin", is_group: false}, {chat_name: "Matias", is_group: false}]
            //setChats(chats)
        } catch(error){
            console.log("Error al obtener chats", error)
        }
    }

    return (
        <div>
            <h1>Chats</h1>
            <ul>
                {chats.map((chat) => (
                    <li>
                        <h3>{chat.chat_name}</h3>
                        <p>{chat.is_group ? "Grupo" : "Individual"}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

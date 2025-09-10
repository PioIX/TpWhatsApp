"use client";

import Contact from "@/components/Contact";
import { useEffect, useState } from "react";

export default function ChatsPage() {
    const [chats, setChats] = useState([])


    useEffect(()=>{
        let userId= localStorage.getItem("userId")
        if(userId) {
            chatsUser(userId)
        } else {
            console.log("No se encontró el ID del usuario")
        }
    }, [])

    async function chatsUser(userId) {
        try{
            console.log("Usuario que voy a enviar:", userId)
            const response = await fetch("http://localhost:4000/chatsUser", {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body:JSON.stringify({userId:userId})
            })
            console.log("Respuesta HTTP status:", response.status)
            const result = await response.json()
            console.log("Respuesta del servidor:", result)
            setChats(result.chats)
        } catch(error){
            console.log("Error al obtener chats", error)
        }
    }

    return (
        <>
            <div>
                <h1>Chats</h1>
                <ul>
                    {chats.map((chat, index) => (
                        <li key={index}>
                            <Contact chats={chat}></Contact>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

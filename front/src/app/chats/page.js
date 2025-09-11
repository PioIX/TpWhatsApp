"use client";

import Contact from "@/components/Contact";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Popup from 'reactjs-popup';

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

    async function newChat(){
        const userId= localStorage.getItem("userId")
        const datosNewChat = {
            userId: userId,
        }
        try{
            console.log("Entro al try")
            const response = await fetch("http://localhost:4000/newChat", {
                method: "POST",
                headers: { "Content-Type" : "application/json"},
                body: JSON.stringify(datosNewChat),
            });
            const result = await response.json();
            console.log("Respuesta del servidor:", result)
            if (result.res === true) {
                alert("¡Chat creado correctamente!");
                setIsPopupOpen(false);
                setEmailInput("");
                chatsUser(userId);
            } else {
                console.log("Error: " + (result.message || "No se pudo crear el chat"));
            }
        } catch(error){
            console.log(error);
        }
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.title}>
                    <h1>Chats</h1>
                    <button onClick={newChat}>Nuevo chat</button>
                </div>
                <div className={styles.chatsList}>
                    <ul>
                        {chats.map((chat, index) => (
                            <li key={index}>
                                <Contact chats={chat}></Contact>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.chatContent}>

                </div>
            </div>
        </>
    );
}

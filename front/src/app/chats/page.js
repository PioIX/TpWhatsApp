"use client";

import Contact from "@/components/Contact";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Popup from 'reactjs-popup';

export default function ChatsPage() {
    const [chats, setChats] = useState([])
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [mailInput, setMailInput] = useState("");

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

    //Abrir el popup
    const openPopup = () => {
        setPopupOpen(true)
    }

    //Cerrar el popup
    const closePopup = () => {
        setPopupOpen(false)
        setMailInput("") //Limpia el input al cerrar el popup
    }

    async function newChat(){
        const userId= localStorage.getItem("userId")
        if(!mailInput.trim()) {
            alert("Por favor, ingresa un mail")
            return
        }
        
        const datosNewChat = {
            userId: userId,
            mail: mailInput.trim() //Se envia el mail al back
        }
        try{
            console.log("Creando chat con: ", datosNewChat)
            const response = await fetch("http://localhost:4000/newChat", {
                method: "POST",
                headers: { "Content-Type" : "application/json"},
                body: JSON.stringify(datosNewChat),
            });
            const result = await response.json();
            console.log("Respuesta del servidor:", result)
            if (result.res === true) {
                alert("¡Chat creado correctamente!");
                closePopup();
                chatsUser(userId);
            } else {
                alert("Error: " + (result.message || "No se pudo crear el chat"));
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
                    <button onClick={openPopup}>Nuevo chat</button>
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

                <Popup 
                    open={isPopupOpen}
                    onClose={closePopup}
                    modal
                    nested
                    closeOnDocumentClick={false}
                >
                    <div className={styles.modal}>
                        <div className={styles.header}>
                            <h2>Nuevo Chat</h2>
                        </div>
                        <div className={styles.content}>
                            <p>Ingresa el mail del usuario con quien quieres chatear</p>
                            <input type="mail" placeholder="ejemplo@mail.com" value={mailInput} onChange={(e) =>setMailInput(e.target.value)} className={styles.mailInput}></input>
                        </div>
                        <div className={styles.actions}>
                            <button onClick={closePopup} className={styles.cancelBtn}>Cancelar</button>
                            <button onClick={newChat} className={styles.createBtn}>Crear chat</button>
                        </div>
                    </div>
                </Popup>
            </div>
        </>
    );
}

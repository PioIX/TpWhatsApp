"use client";

import Contact from "@/components/Contact";
import Input from "@/components/Input";
import Message from "@/components/Message";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Popup from 'reactjs-popup';
import { useSocket } from "@/hooks/useSocket";

export default function ChatsPage() {
    const [chats, setChats] = useState([])
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [mailInput, setMailInput] = useState("");
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [userTyping, setUserTyping] = useState("");

    const {socket, isConnected} = useSocket(
        {withCredentials: true},
        "http://localhost:4000/"
    )

    useEffect(()=>{
        let userId= localStorage.getItem("userId")
        if(userId) {
            chatsUser(userId)
        } else {
            console.log("No se encontró el ID del usuario")
        }
    }, [])

    useEffect(() => {
        if (socket) {
            console.log('Socket conectado:', isConnected);
            
            socket.on('newMessage', (data) => {
                console.log("LO q tengo antes   ", messages)
                console.log("LO QUE VOY A GUARDAR", data.message)
                setMessages([...messages, data.message])
                
            });

            socket.on('chat-messages', (data) => {
                console.log('Chat messages:', data);
            });

            socket.on('pingAll', (data) => {
                console.log('Ping recibido:', data);
            });

            return () => {
                socket.off('newMessage');
                socket.off('chat-messages');
                socket.off('pingAll');
            };
        }
    }, [socket]);

    useEffect(() => {
        if (socket && selectedChat) {
            socket.emit('joinRoom', {room: `chat_${selectedChat.id_chat}`});
            console.log('Uniéndose al chat:', `chat_${selectedChat.id_chat}`);
        }
    }, [socket, selectedChat]);

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
                if (result.existing) {
                    alert("Chat encontrado - redirigiendo...");
                } else {
                    alert("¡Chat creado correctamente!");
                }
                closePopup();
                chatsUser(userId);
            } else {
                alert("Error: " + (result.message || "No se pudo crear el chat"));
            }
        } catch(error){
            console.log(error);
        }
    }

    async function chatHistory(chat){
        const userId= localStorage.getItem("userId")

        const data = {
            id_chat: chat.id_chat,
            userId: userId
        }

        try{
            const response = await fetch("http://localhost:4000/chatHistory", {
                method: "POST",
                headers: {"Content-Type" : "application/json"},
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if(result.res === true){
                console.log("TRAIGO MENSAJES", result.messages);
                setSelectedChat(chat);
                setMessages("a")
                if (socket && isConnected) {
                    const roomName = `chat_${chat.id_chat}`;
                    socket.emit('joinRoom', {room: roomName});
                }
            } else {
                console.log("Error al cargar historial:", result.message)
            }
        } catch(error){
            console.log("Error al cargar historial:", error)
        }
    }

    async function sendMessage() {
        if (!newMessage.trim() || !selectedChat || !socket || !isConnected) {
            console.log('No se puede enviar mensaje:', { 
                message: newMessage.trim(), 
                chat: selectedChat, 
                socket: !!socket, 
                connected: isConnected 
            });
            return;
        }

        const userId = localStorage.getItem("userId");
        const messageContent = newMessage.trim()

        setNewMessage("")
        
        console.log('Enviando mensaje con sendMessage event:', {
            chatId: selectedChat.id_chat,
            userId: userId,
            content: messageContent
        });

        socket.emit('sendMessage', {
            chatId: selectedChat.id_chat,
            userId: userId,
            content: messageContent
        });
    }

    const sendPingAll = () => {
        if (socket && isConnected) {
            socket.emit('pingAll', 'Mensaje de prueba para todos');
            console.log('Ping enviado a todos');
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    }

    const handleMessageChange = (e) => {
        setNewMessage(e.target.value);
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.title}>
                    <h1>Chats</h1>
                    <button onClick={openPopup}>Nuevo chat</button>
                    <button onClick={sendPingAll} disabled={!isConnected}>Ping a todos {isConnected ? '✅' : '❌'}</button>
                </div>
                <div className={styles.chatsList}>
                    <ul>
                        {chats.map((chat, index) => (
                            <li key={index}>
                                <Contact chats={chat} onClick={() => chatHistory(chat)} isSelected = {selectedChat && selectedChat.id_chat === chat.id_chat}></Contact>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.chatContent}>
                        {selectedChat ? (
                            <>
                                <div className={styles.chatHeader}>
                                    <div className={styles.chatHeaderInfo}>
                                        <img src={selectedChat.photo || "https://imagenes2.eltiempo.com/files/image_600_455/files/fp/uploads/2025/04/01/67ec4ef31f2ce.r_d.866-866-3464.jpeg"}
                                            alt={selectedChat.chat_name || selectedChat.username}
                                            className={styles.chatAvatar}
                                        ></img>
                                        <h3>{selectedChat.chat_name || selectedChat.username}</h3>
                                        <span style={{ marginLeft: '10px', fontSize: '12px' }}>
                                            {isConnected ? '🟢 Online' : '🔴 Offline'}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.messagesArea}>
                                    {messages.length > 0 ? (
                                        messages.map((message, index) => (
                                            <Message key={index} message={message} isMyMessage={message.id_user === localStorage.getItem("userId")} userId={localStorage.getItem("userId")}></Message>
                                        ))
                                    ) : (
                                        <div className={styles.noMessages}>
                                            No hay mensajes en este chat
                                        </div>  
                                    )}
                                    {userTyping && (
                                        <div className={styles.typingIndicator}>
                                            {userTyping}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.messageInput}>
                                    <Input type="text" placeholder="Escribe un mensaje..." value={newMessage} onChange={handleMessageChange} onKeyPress = {handleKeyPress} page="chat"></Input>
                                    <button onClick={sendMessage} className={styles.sendButton} disabled={!newMessage.trim()}>Enviar {isConnected ? '' : '(Sin conexión)'}</button>
                                </div>
                            </>
                        ) : (
                            <div className={styles.noChatSelected}>
                                <h3>Selecciona un chat para comenzar</h3>
                                <p>Elige una conversación de la lista para ver los mensajes</p>
                                <p>Estado de conexión: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}</p>
                            </div>
                        )}
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
                            <Input type="mail" placeholder="ejemplo@mail.com" value={mailInput} onChange={(e) =>setMailInput(e.target.value)} page="modal"></Input>
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

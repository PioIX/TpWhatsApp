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
    const [messageSocket, setMessageSocket] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [userTyping, setUserTyping] = useState("");

    const {socket, isConnected} = useSocket(
        {withCredentials: true},
        "http://localhost:4000/"
    )

    useEffect(()=>{
        let userId= sessionStorage.getItem("userId")
        if(userId) {
            chatsUser(userId)
        } else {
            console.log("No se encontró el ID del usuario")
        }
    }, [])

    useEffect(()=>{
        console.log(messages)
    }, [messages])

    // useEffect(()=>{
    //     console.log(messages)
    //     setMessages([...messages, messageSocket])
    // }, [messageSocket])

    useEffect(() => {
        if (socket) {
            console.log('Socket conectado:', isConnected);
            
            socket.on('newMessage', (data) => {
                console.log('Nuevo mensaje recibido:', data);
                setMessages((prevMessages) => [...prevMessages, {
                    id_user: data.message.userId,
                    content: data.message.content,
                    date: data.message.date
                }])
                    // if (!Array.isArray(prevMessages)) {
                    //     return [{
                    //         id_user: data.message.id_user,
                    //         content: data.message.content,
                    //         date: data.message.date
                    //     }];
                    // }
                    // return [...prevMessages, {
                    //     id_user: data.message.id_user,
                    //     content: data.message.content,
                    //     date: data.message.date
                    // }];
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
            const uniqueChats = result.chats?.filter((chat, index, self) => 
                index === self.findIndex(c => c.id_chat === chat.id_chat)
            ) || [];
            setChats(uniqueChats)
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
        const userId= sessionStorage.getItem("userId")
        if(!mailInput.trim()) {
            alert("Por favor, ingresa un mail")
            return
        }
        const datosNewChat = {
            userId: userId,
            mail: mailInput.trim()
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

    function chatHistory(chat) {
        const userId = sessionStorage.getItem("userId");
        const data = {
            id_chat: chat.id_chat,
            userId: userId
        };

        fetch("http://localhost:4000/chatHistory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
            .then(res => res.json())
            .then(result => {
                console.log("Historial del chat:", result);
                setSelectedChat(chat);
                setMessages(Array.isArray(result.messages) ? result.messages : [])
            } )
            .catch(error => {
                console.log("Error al obtener historial:", error);
                setMessages([]);
            });
            if (socket) {
                socket.emit("joinRoom", {room: `chat_${chat.id_chat}`});
            }
    }

    function sendMessage() {
        try {
            if (!newMessage.trim() || !selectedChat || !socket || !isConnected) {
                console.log('No se puede enviar mensaje:', { 
                    message: newMessage.trim(), 
                    chat: selectedChat, 
                    socket: !!socket, 
                    connected: isConnected 
                });
                return;
            }
    
            const userId = sessionStorage.getItem("userId");
            const messageContent = newMessage.trim()
    
            setNewMessage("")
    
    
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            
            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            
            const data = {
                chatId: selectedChat.id_chat,
                userId: userId,
                content: messageContent,
                date: formattedDate
            }
    
            if (socket) {
                socket.emit('sendMessage', data);
            }

        } catch (error) {
            console.log(error)
        }
    }

    const sendPingAll = () => {
        if (socket && isConnected) {
            socket.emit('pingAll', 'Mensaje de prueba para todos');
            console.log('Ping enviado a todos');
        }
    }

    function handleKeyPress(e) {
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
                                        <img src={selectedChat.photo_group || "https://imagenes2.eltiempo.com/files/image_600_455/files/fp/uploads/2025/04/01/67ec4ef31f2ce.r_d.866-866-3464.jpeg"}
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
                                    {/* {console.log(String(messages[0].id_user), (sessionStorage.getItem("userId")))} */}
                                    {messages && messages.length > 0 ? (
                                        messages.map((msg, i) => (
                                            <Message
                                                key={i}
                                                message={msg.content}
                                                date={msg.date}
                                                isMyMessage={String(msg.id_user) === String(sessionStorage.getItem("userId"))}
                                            />
                                        ))
                                    ) : (
                                        <div className={styles.noMessages}>
                                            No hay mensajes en este chat
                                        </div>
                                    )}
                                </div>

                                <div className={styles.messageInput}>
                                    <Input type="text" placeholder="Escribe un mensaje..." value={newMessage} onChange={handleMessageChange} onKeydown={handleKeyPress} page="chat"></Input>
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
"use client";

import Contact from "@/components/Contact";
import Input from "@/components/Input";
import Message from "@/components/Message";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import Popup from 'reactjs-popup';
import { io } from 'socket.io-client';

export default function ChatsPage() {
    const [chats, setChats] = useState([])
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [mailInput, setMailInput] = useState("");
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [userTyping, setUserTyping] = useState("");
    const [typingTimeout, setTypingTimeout] = useState(null);


    useEffect(()=>{
        let userId= localStorage.getItem("userId")
        if(userId) {
            chatsUser(userId)
        } else {
            console.log("No se encontró el ID del usuario")
        }
    }, [])

    //useEffect PARA INICIALIZAR WEBSOCKET 
    useEffect(() => {
        const newSocket = io('http://localhost:4000');
        setSocket(newSocket);
        console.log('WebSocket conectado');
    // Limpiar conexión al desmontar el componente
        return () => {
            newSocket.disconnect();
        };
    }, []);

    //useEffect PARA MANEJAR EVENTOS DE WEBSOCKET
    useEffect(() => {
        if (!socket) return;
        // Escuchar nuevos mensajes
        socket.on('new-message', (message) => {
            console.log('Nuevo mensaje recibido:', message);
            if (selectedChat && message.id_chat === selectedChat.id_chat) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
        });

    // Escuchar indicador de escritura
        socket.on('user-typing', (data) => {
            if (data.isTyping) {
                setUserTyping(`${data.username} está escribiendo...`);
            } else {
                setUserTyping("");
            }
        });

    // Limpiar listeners al cambiar socket
        return () => {
            socket.off('new-message');
            socket.off('user-typing');
        };
    }, [socket, selectedChat]); 

    //useEffect PARA UNIRSE AL CHAT CUANDO SE SELECCIONA
    useEffect(() => {
        if (socket && selectedChat) {
            socket.emit('join-chat', selectedChat.id_chat);
            console.log('Uniéndose al chat:', selectedChat.id_chat);
            
            return () => {
                socket.emit('leave-chat', selectedChat.id_chat);
                console.log('Abandonando chat:', selectedChat.id_chat);
            };
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
            console.log("Respuesta del servidor: ", result)
            if(result.res === true){
                setSelectedChat(chat);
                setMessages(result.messages || [])
            } else {
                console.log("Error al cargar historial:", result.message)
            }
        } catch(error){
            console.log("Error al cargar historial:", error)
        }
    }

    //Reemplace la funcion anterior sendMessage, por esta:
    async function sendMessage() {
        if (!newMessage.trim() || !selectedChat || !socket) return;
        const userId = localStorage.getItem("userId");
        try {
            const response = await fetch(`http://localhost:4000/users?id_user=${userId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const userData = await response.json();
            const user = userData[0]; // Primer usuario del resultado
            
            if (user) {
                // Enviar mensaje a través de WebSocket
                socket.emit('send-message', {
                    chatId: selectedChat.id_chat,
                    userId: userId,
                    content: newMessage.trim(),
                    username: user.username
                });
                console.log('Enviando mensaje:', {
                    chatId: selectedChat.id_chat,
                    content: newMessage.trim()
                });
                setNewMessage("");
            }
        } catch (error) {
            console.log("Error al enviar mensaje:", error);
        }
    }

    //Agregue esta función para manejar el indicador de escritura 
    function handleTyping() {
        if (!socket || !selectedChat) return;
        const userId = localStorage.getItem("userId");
        // Emitir que el usuario está escribiendo
        socket.emit('typing', {
            chatId: selectedChat.id_chat,
            userId: userId,
            username: 'Usuario', // Puedes mejorar esto obteniendo el username real
            isTyping: true
        });
        // Limpiar timeout anterior
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }
        // Establecer nuevo timeout para dejar de escribir
        const timeout = setTimeout(() => {
            socket.emit('typing', {
                chatId: selectedChat.id_chat,
                userId: userId,
                username: 'Usuario',
                isTyping: false
            });
        }, 1500); // Deja de escribir después de 1.5 segundos de inactividad
        setTypingTimeout(timeout);
    }

    const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    } else {
        handleTyping();
    }
    };

    const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
        handleTyping();
    }
    };

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
                                        <div className={styles.typingIndicator} style={{
                                            padding: '10px',
                                            fontStyle: 'italic',
                                            color: '#666',
                                            textAlign: 'center'
                                        }}>
                                            {userTyping}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.messageInput}>
                                   <Input type="text" placeholder="Escribe un mensaje..." value={newMessage} onChange={handleMessageChange} onKeyPress = {handleKeyPress} page="chat"></Input>
                                    <button onClick={sendMessage} className={styles.sendButton} disabled={!newMessage.trim()}>Enviar</button>
                                </div>
                            </>
                        ) : (
                            <div className={styles.noChatSelected}>
                                <h3>Selecciona un chat para comenzar</h3>
                                <p>Elige una conversación de la lista para ver los mensajes</p>
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

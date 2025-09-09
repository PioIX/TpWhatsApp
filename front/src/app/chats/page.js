"use client";

import { useEffect, useState } from "react";

export default function ChatsPage() {
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Fetch all chats
        const fetchChats = async () => {
            try {
                const res = await fetch("/chats");
                const data = await res.json();
                setChats(data);
                console.log("Chats traídos correctamente");
            } catch (error) {
                console.log("Error al traer los chats", error);
            }
        };
        fetchChats();
    }, []);

    // Fetch messages when a chat is selected
    useEffect(() => {
        if (selectedChat) {
            const fetchMessages = async () => {
                try {
                    const res = await fetch(`/messages/${selectedChat.id_chat}`);
                    const data = await res.json();
                    setMessages(data);
                    console.log("Mensajes traídos correctamente");
                } catch (error) {
                    console.log("Error al traer los mensajes", error);
                }
            };
            fetchMessages();
        }
    }, [selectedChat]);

    return (
        <div>
            <h1>Chats</h1>

            {/* Lista de chats */}
            <ul>
                {chats.map((chat) => (
                    <li key={chat.id_chat} onClick={() => setSelectedChat(chat)}>
                        <h3>{chat.chat_name}</h3>
                        <p>{chat.is_group ? "Grupo" : "Individual"}</p>
                    </li>
                ))}
            </ul>

            {/* Si un chat está seleccionado, muestra los mensajes */}
            {selectedChat && (
                <div>
                    <h2>Mensajes en {selectedChat.chat_name}</h2>
                    <div className="messages-container">
                        {messages.map((message, index) => (
                            <div key={index} className="message">
                                <img
                                    src={message.photo}
                                    alt={message.username}
                                    className="message-avatar"
                                />
                                <div>
                                    <strong>{message.username}</strong>
                                    <p>{message.content}</p>
                                    <small>{new Date(message.date).toLocaleString()}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

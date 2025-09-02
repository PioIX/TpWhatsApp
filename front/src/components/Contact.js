"use client"

export default function Contact(props) {
    return (
        <div className="contact-item">
            <img src={props.src} alt="Profile" className="profile-img"></img>
            <div className="contact-info">
                <p className="chatname">{props.chatname}</p>
                <p className="lastMsg">{props.lastMsg || "No hay mensajes"}</p>
            </div>
        </div>
    )
}

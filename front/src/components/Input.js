"use client"
import styles from "./Input.module.css"
import clsx from "clsx"

export default function Input({page, ...props}) {
    return (
        <>
           <input className={clsx(styles.input, {
                [styles.loginPage]: page === "login",
                [styles.chatPage]: page === "chat",
                [styles.modalInput]: page === "modal",
                })} 
                type={props.type} onChange={props.onChange} placeholder={props.placeholder} id={props.id} value={props.value} onKeyDown={props.onKeyDown}></input>
        </>
    )
}
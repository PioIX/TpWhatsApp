"use client"
import styles from "@/componentes/Input.module.css"
export default function Input(props) {
    return (
        <>
           <input type={props.type} onChange={props.onChange} placeholder={props.placeholder} id={props.id} value={props.value}></input>
        </>
    )
}
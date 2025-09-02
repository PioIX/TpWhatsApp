"use client"
import styles from "./Input.module.css"
export default function Input(props) {
    return (
        <>
           <input style={styles} type={props.type} onChange={props.onChange} placeholder={props.placeholder} id={props.id} value={props.value}></input>
        </>
    )
}
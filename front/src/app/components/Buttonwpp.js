"use client";
import clsx from "clsx";
import styles from "@/components/Buttonwpp.module.css"
export default function Buttonwpp(props) {
    return (
        <button onClick={props.onClick} type={props.type}  className={
            clsx(
                {
                    [styles.wpp]: props.color == "wpp",  
                }
            )
        }>{props.texto}</button>
    );
}
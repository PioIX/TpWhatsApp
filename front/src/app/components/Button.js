"use client"

export default function Button(props) {
    function imprimir(){
        console.log("Hola");
    }

    return (
        <>
            <button onClick={props.onClick} >{props.text}</button>

        </>
    )
}
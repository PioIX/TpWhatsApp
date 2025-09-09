"use client"

import Input from "./Input"
import BotonInput from "@/components/ButtonInput"

export default function Form(props) {
    function mensaje() {
        console.log("Completo")
    }
    function respuesta() {
        console.log("Cambio 1")
    }
    function respuesta2() {
        console.log("Cambio 2")
    }
    return (
        <>
            <h3>Nombre</h3>
            <Input respuesta={respuesta}></Input><ButtonInput mensaje={mensaje}></ButtonInput>
            <h3>Apellido</h3>
            <Input respuesta={respuesta2}></Input><ButtonInput mensaje={mensaje}></ButtonInput>
        </>
    )
}
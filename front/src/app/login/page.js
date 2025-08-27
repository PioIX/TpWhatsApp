"use client"

import Input from "../components/Input"
import Button from "../components/Button"

export default function LoginPage(){
    function ingresar(){
        
    }
    
    return (
        <>
            <div>
                <h1>Login</h1>
                <Input type="text" placeholder="Ingrese su mail"></Input>
                <Input type="text" placeholder="Ingrese su contraseña"></Input>
                <Button text="Ingresar" onClick={ingresar}></Button>
                <Button text="Registrarse"></Button>
            </div>
        </>
    )
}
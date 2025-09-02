"use client"

import Input from "../../components/Input"
import Button from "../../components/Button"
import { useRouter } from "next/router"

export default function LoginPage(){
    const [mail, setMail]  = useState("")
    const [password, setPassword]  = useState("")
    const [message, setMessage]  = useState("")
    const router = useRouter();

    async function ingresar(){
        if(!mail || !password){
            setMessage("Faltan datos")
            return
        }
        try{
            const res = await fetch("http://localhost:4000/login", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({mail, password})
            })
            const data = await res.json()
            if(!res.ok){
                setMessage(data.error)
                return
            }
            setMessage("Ingreso exitoso")
            router.push("/chats")
        } catch(error) {
            setMessage("Error al ingresar")
        }
    }

     async function registrarse(){
        if(!mail || !password){
            setMessage("Faltan datos")
            return
        }
        try{
            const res = await fetch("http://localhost:4000/register", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({mail, password})
            })
            const data = await res.json()
            if(!res.ok){
                setMessage(data.error)
                return
            }
            setMessage("Usuario registrado exitosamente")
        } catch(error) {
            setMessage("Error al registrar usuario")
        }
    }

    return (
        <>
            <div>
                <h1>Login</h1>
                <Input type="text" placeholder="Ingrese su mail" value={mail}></Input>
                <Input type="text" placeholder="Ingrese su contraseña" value={password}></Input>
                <Button text="Ingresar" onClick={ingresar}></Button>
                <Button text="Registrarse" onClick={registrarse}></Button>
            </div>
        </>
    )


}
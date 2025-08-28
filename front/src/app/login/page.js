"use client"

import Input from "../components/Input"
import Button from "../components/Button"
import { useRouter } from "next/router"

export default function LoginPage(){
    const [email, setEmail]  = useState("")
    const [password, setPassword]  = useState("")
    const [message, setMessage]  = useState("")
    const router = useRouter();

    async function ingresar(){
        if(!email || !password){
            setMessage("Faltan datos")
            return
        }
        try{
            const res = await fetch("http://localhost:4000/login", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({email, password})
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
        if(!email || !password){
            setMessage("Faltan datos")
            return
        }
        try{
            const res = await fetch("http://localhost:4000/login", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({email, password})
            })
            const data = await res.json()
        } catch(error) {
            setMessage("Error al regsitrarse")
        }
    }
    
    return (
        <>
            <div>
                <h1>Login</h1>
                <Input type="text" placeholder="Ingrese su mail"></Input>
                <Input type="text" placeholder="Ingrese su contraseña"></Input>
                <Button text="Ingresar" onClick={ingresar}></Button>
                <Button text="Registrarse" onClick={registrarse}></Button>
            </div>
        </>
    )
}
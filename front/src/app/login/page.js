"use client"

import Input from "../components/Input"
import Button from "../components/Button"

export default function LoginPage(){
    const [email, setEmail]  = useState("")
    const [password, setPassword]  = useState("")
    const [error, setError]  = useState("")

    async function ingresar(){
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
            setError("Error al ingresar")
        }
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
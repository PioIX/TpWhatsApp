"use client"
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
    const [description, setDescription] = useState("")
    const [mail, setMail] = useState("")
    const [username, setUsername] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [photo, setPhoto] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [user, setUser] = useState({ existe: null })

    const router = useRouter()
    
    useEffect(() => {
        if (user.existe === false) {
            SignUp()
        }
    }, [user])

    function saveUsername(event) {
        setUsername(event.target.value)
    }

    function saveMail(event) {
        setMail(event.target.value)
    }

    function saveDescription(event) {
        setDescription(event.target.value)
    }

    function savePhoneNumber(event) {
        setPhoneNumber(event.target.value)
    }

    function savePhoto(event) {
        setPhoto(event.target.value)
    }

    function savePassword(event) {
        setPassword(event.target.value)
    }

    function saveConfirmPassword(event) {
        setConfirmPassword(event.target.value)
    }

    function look() {
        console.log(phoneNumber, photo, username, mail, password)
    }

    async function UserExists(mail) {
        try {
            const response = await fetch("http://localhost:4000/findUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ mail: mail })
            })
            const result = await response.json()
            console.log(result)
            console.log(result.length)
            return result.length > 0
        } catch (error) {
            console.error("Error checking user:", error)
            return false
        }
    }

    async function SignUp() {
        if (password === confirmPassword) {
            const existe = await UserExists(mail)
            if (existe) {
                console.log("Usuario ya existe")
                alert("El usuario ya existe")
            } else {
                console.log("Usuario no existe, creando...")
                try {
                    const response = await fetch("http://localhost:4000/users", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            phone_number: phoneNumber,
                            photo: photo,
                            username: username,
                            mail: mail,
                            password: password
                        })
                    })
                    const result = await response.json()
                    console.log("Usuario creado:", result)
                    router.replace("../chat")
                } catch (error) {
                    console.error("Error creating user:", error)
                    alert("Error al crear el usuario")
                }
            }
        } else {
            alert("Las contraseñas no coinciden")
        }
    }

    return (
        <div>
            <h1>Registro</h1>
            <Input 
                text="Número de Teléfono" 
                placeholder="Escriba su número de teléfono" 
                className="register-inputs" 
                type="tel" 
                onChange={savePhoneNumber} 
                required={true}
            />
            <Input 
                text="Foto de Perfil (URL)" 
                placeholder="URL de la foto" 
                className="register-inputs" 
                type="url" 
                onChange={savePhoto} 
                required={false}
            />
            <Input 
                text="Nombre de Usuario" 
                placeholder="Escriba su nombre de usuario" 
                className="register-inputs" 
                type="text" 
                onChange={saveUsername} 
                required={true}
            />
            <Input 
                text="Correo Electrónico" 
                placeholder="Escriba su email" 
                className="register-inputs" 
                type="email" 
                onChange={saveMail} 
                required={true}
            />
            <Input 
                text="Contraseña" 
                placeholder="Escriba su contraseña" 
                className="register-inputs" 
                type="password" 
                onChange={savePassword} 
                required={true}
            />
            <Input 
                text="Confirmar Contraseña" 
                placeholder="Confirme su contraseña" 
                className="register-inputs" 
                type="password" 
                onChange={saveConfirmPassword} 
                required={true}
            />
            <Input 
                text="Descripción Personal" 
                placeholder="Escriba la descripción personal" 
                className="register-inputs" 
                type="text" 
                onChange={saveDescription} 
                required={false}
            />

            <Button onClick={SignUp} text="Registrarse" />
            <Button onClick={look} text="Ver Datos" />
        </div>
    )
}
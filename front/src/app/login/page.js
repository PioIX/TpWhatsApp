"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../components/Input";
import Button from "../../components/Button";
import styles from "./page.module.css";

export default function RegistroYLogin() {
  const [modo, setModo] = useState("login");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [photo, setPhoto] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [textoMensaje, setTextoMensaje] = useState("");
  const router = useRouter();

  const showModal = (title, message) => {
    setTextoMensaje(`${title}: ${message}`);
    setMostrarMensaje(true);
    setTimeout(() => setMostrarMensaje(false), 3000); 
  };

  async function ingresar() {
    if(!mail || !password) {
      showModal("Error. Debes completar todos los campos")
      return
    }
    const datosLogin = {
      mail: mail, 
      password: password,
    }
    try {
      console.log(datosLogin)
      const response = await fetch("http://localhost:4000/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin),
      })
      const result = await response.json()
      console.log("Respuesta del servidor:", result)
      if (result.validar === true) {
        showModal("Éxito", "¡Has iniciado sesión correctamente!");
        sessionStorage.setItem("userId", result.id)
        router.push("/chats");
      } else {
        showModal("Error", result.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
    }
  }

  async function registrar() {
    if (password !== confirmPassword) {
      showModal("Error", "Las contraseñas no coinciden");
      return;
    }

    const datosRegistro = {
      username,
      phone_number: phoneNumber,
      mail,
      password,
      photo: photo || null, 
    };

    try {
      const response = await fetch("http://localhost:4000/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosRegistro),
      });

      const result = await response.json();
      console.log(result);

      if (result.res === true) {
        showModal("Éxito", "¡Usuario registrado correctamente!");
        setTimeout(() => setModo("login"), 1000);
      } else {
        showModal("Error", result.message || "No se pudo registrar el usuario");
      }
    } catch (error) {
      console.error(error);
      showModal("Error", "Hubo un problema con la conexión al servidor.");
    }
  }

  return (
    <div className={styles.container}>
      {modo === "login" ? (
        <>
          <h1 className={styles.titulo}>Iniciar sesión</h1>
          <Input type="email" placeholder="Correo electrónico" value={mail} onChange={(e) => setMail(e.target.value)} page="login"></Input>
          <br></br>
          <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} page="login"></Input>
          <br></br>
          <Button onClick={ingresar} text="Ingresar"></Button>
          <p className={styles.texto}>
            ¿No tenés cuenta?{" "}
            <button className={styles.linkBoton} onClick={() => setModo("registro")}>Registrate</button>
          </p>
        </>
      ) : (
        <>
          <h1 className={styles.titulo}>Registrarse</h1>
          <Input type="text" placeholder="Nombre de usuario" value={username} onChange={(e) => setUsername(e.target.value)} page="login"></Input>
          <br></br>
          <Input type="email" placeholder="Correo electrónico" value={mail} onChange={(e) => setMail(e.target.value)} page="login"></Input>
          <br></br>
          <Input type="tel" placeholder="Número de teléfono" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} page="login"></Input>
          <br></br>
          <Input type="url" placeholder="URL de la foto (opcional)" value={photo} onChange={(e) => setPhoto(e.target.value)} page="login"></Input>
          <br></br>
          <Input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} page="login"></Input>
          <br></br>
          <Input type="password" placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} page="login"cd></Input>
          <br></br>
          <Button onClick={registrar} text="Registrarse"></Button>
          <p className={styles.texto}>
            ¿Ya tenés cuenta?{" "}
            <button className={styles.linkBoton} onClick={() => setModo("login")}>Inicia sesión</button>
          </p>
        </>
      )}

      {mostrarMensaje && (
        <div className={styles.mensaje}>
          {textoMensaje}
        </div>
      )}
    </div>
  );
}
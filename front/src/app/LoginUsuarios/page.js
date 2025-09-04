"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Messages from "../components/Message";
import Input from "../components/Input";
import Button from "../components/Button";
import Contact from "../components/Contact";
import styles from "../page.module.css";

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

  const closeModal = () => {
    setMostrarMensaje(false);
  };

  async function ingresar() {
    const datosLogin = {
      mail: mail,
      password: password,
    };

    try {
      /* hola soy facu,
      marta me dijo que me fije que por que no les anda el codigo y esta aca el error.
      me fijo despues como corregirlo pero -. El problema es que en react no se utiliza await como metodo para realizar un fetch.
      La estructura de un fetch es la siguiente:

      fetch('http://localhost:4006/findUserId', Aca realizo el fetch con el que tenga en el back.
        method: 'POST', Indico el metodo 
        headers: { 'Content-Type': 'application/json' }, esto va siempre asi
        body: JSON.stringify({ mail: user }) --- Por aca le paso los parametros del body
      })
      .then(response => response.json()) Esto es muy importante --- .then reemplaza a lo que hace el await. Justamente await "esperar" - then "despues" . Se pone .then(nombre_variable => nombre_variable.json()) ---- esto reemplaza a el const response y a const result = await response.json() por nuevas variables que la verdad que no importan. la que importa es la siguiente

      .then(data => { --- Esta de aca importa, ya que despues de ese .then la variable con nombre que le pongan es la que contiene lo que trajo desde el back en formato json. se escribe .then(nombre_variable => {lo que realiza la funcion en respuesta (puede ser guardar variables - realizar funciones - condiciones - entre mil cosas) })

      aca por ejemplo despues del data yo hice esto : 
          sessionStorage.setItem("userId", data[0].id_usuario); guarda el id del usuario que se logueo
          console.log("userId guardado en sessionStorage:", data[0].id_usuario); muestra que usuario se logueo
          router.replace("./../chat") manda a /chat
      })
          
      Aca te lo dejo completo sin texto por el medio para que lo entiendas mejor

      fetch('http://localhost:4006/findUserId', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: user })
        })
        .then(response => response.json())
        .then(data => {
          sessionStorage.setItem("userId", data[0].id_usuario); // guardar userId 
          console.log("userId guardado en sessionStorage:", data[0].id_usuario);
          router.replace("./../chat")
        })
      
      */


      /* por lo tanto - el siguiente fetch que queres realizar LoginUsuarios tendría que ser de x manera

      fetch("http://localhost:4000/LoginUsuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin) // despues fijate si esto se pasa bien . 
      })
      .then(response => response.json())
      .then(result => {
          aca la vdd que habria que hacer una validacion de usuarios con if . (usar useEffect)
        })
      */
      const response = await fetch("http://localhost:4000/LoginUsuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosLogin),
      });

      const result = await response.json();
      console.log(result);

      if (result.res === true) {
        showModal("Éxito", "¡Has iniciado sesión correctamente!");
        router.push("/dashboard");
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
      const response = await fetch("http://localhost:4000/RegistroUsuarios", {
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
          <Input
            className={styles.input}
            type="email"
            placeholder="Correo electrónico"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
          />
          <Input
            className={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button className={styles.btn} onClick={ingresar} text="Ingresar"></Button>
          <p className={styles.texto}>
            ¿No tenés cuenta?{" "}
            <button
              className={styles.linkBoton}
              onClick={() => setModo("registro")}
            >
              Registrate
            </button>
          </p>
        </>
      ) : (
        <>
          <h1 className={styles.titulo}>Registrarse</h1>
          <Input
            className={styles.input}
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Input
            className={styles.input}
            type="email"
            placeholder="Correo electrónico"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
          />
          <Input
            className={styles.input}
            type="tel"
            placeholder="Número de teléfono"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <Input
            className={styles.input}
            type="url"
            placeholder="URL de la foto (opcional)"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />
          <Input
            className={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            className={styles.input}
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button className={styles.btn} onClick={registrar} text="Registrarse"></Button>
          <p className={styles.texto}>
            ¿Ya tenés cuenta?{" "}
            <button
              className={styles.linkBoton}
              onClick={() => setModo("login")}
            >
              Inicia sesión
            </button>
          </p>
        </>
      )}

      {mostrarMensaje && (
        <Messages
          texto={textoMensaje}
        />
      )}

      <Contact />
    </div>
  );
}
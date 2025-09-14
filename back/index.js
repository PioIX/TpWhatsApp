var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');
const { realizarQuery } = require('./modulos/mysql');

var app = express(); //Inicializo express
var port = process.env.PORT || 4000; //Ejecuto el servidor en el puerto 3000

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', function (req, res) {
    res.status(200).send({
        message: 'GET Home route working fine!'
    });
});

app.listen(port, function () {
    console.log(`Server running in http://localhost:${port}`);
});

app.get('/users', async function (req, res) {
    let respuesta;
    if (req.query.id != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Users WHERE id_user=${req.query.id_user}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM Users");
    }
    res.send(respuesta);
});

app.get('/chats', async function (req, res) {
    let respuesta;
    if (req.query.id != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Chats WHERE id_chat=${req.query.id_chat}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM Chats");
    }
    res.send(respuesta);
});

app.get('/messages', async function (req, res) {
    let respuesta;
    if (req.query.id != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM Messages WHERE id_message=${req.query.id_message}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM Messages");
    }
    res.send(respuesta);
});

app.get('/chatsmessage', async function (req, res) {
    let respuesta;
    if (req.query.id != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM ChatsMessage WHERE id_chat_message=${req.query.id_chat_message}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM ChatsMessage");
    }
    res.send(respuesta);
});

app.post('/users',async function (req, res) {
    console.log(req.body);
    try {
        await realizarQuery(`
        INSERT INTO Users (phone_number, photo, username, mail, password) VALUES
            ("${req.body.phone_number}","${req.body.photo}","${req.body.username}","${req.body.mail}","${req.body.password}");
        `);
        res.send({res:"Usuario agregado"});
    } catch (error) {
        console.log("Error al agregar usuario:", error);
        res.status(500).send({res:"No se pudo agregar el usuario"});
    }
});

app.post('/chats',async function (req, res) {
    console.log(req.body);
    try {
        await realizarQuery(`
        INSERT INTO Chats (is_group, photo_group, chat_name, id_user) VALUES
            ("${req.body.is_group}","${req.body.photo_group}","${req.body.chat_name}","${req.body.id_user}";
        `);
        res.send({res:"Chat agregado"});
    } catch (error) {
        console.log("Error al agregar el chat:", error);
        res.status(500).send({res:"No se pudo agregar el chat"});
    }
})

app.post('/chatsmessage',async function (req, res) {
    console.log(req.body);
    try {
        await realizarQuery(`
        INSERT INTO ChatsMessage (id_message, id_chat) VALUES
            ("${req.body.id_message}","${req.body.id_chat}";
        `);
        res.send({res:"Chat con mensajes agregado"});
    } catch (error) {
        console.log("Error al agregar el chat:", error);
        res.status(500).send({res:"No se pudo agregar el chat"});
    }
})

app.post('/messages',async function (req, res) {
    console.log(req.body);
    try {
        await realizarQuery(`
        INSERT INTO Messages (photo, date, id_user, content) VALUES
            ("${req.body.photo}","${req.body.date}","${req.body.id_user}","${req.body.content}";
        `);
        res.send({res:"Mensaje agregado"});
    } catch (error){
        console.log("Error al agregar el mensaje:", error);
        res.status(500).send({res:"No se pudo agregar el mensaje"});
    }
})


app.post('/loginUser', async function (req, res) {
    try {
        const result = await realizarQuery(`
            SELECT * FROM Users WHERE mail = "${req.body.mail}";
        `);
        
        console.log("Resultado de búsqueda:", result);
        if(result.length > 0){
            res.send({validar: true, id: result[0].id_user})
        } else {
            res.send({validar: false})
        }
    } catch (error) {
        console.log("Error al buscar usuario:", error);
        res.status(500).send({error: "No se pudo buscar el usuario"});
    }
});

app.post('/registerUser', async function (req,res) {
    console.log(req.body)
    try{
        const existingUser = await realizarQuery(`
            SELECT * FROM Users WHERE mail = "${req.body.mail}";
        `);
        if (existingUser.length > 0) {
            res.send({ res: false, message: "Ya existe un usuario con este email" });
            return;
        }
        const insertResult = await realizarQuery(`
            INSERT INTO Users (username, phone_number, mail, password, photo) 
            VALUES ("${req.body.username}", "${req.body.phone_number}", "${req.body.mail}", "${req.body.password}", "${req.body.photo}");
        `);
        console.log("Usuario registrado:", insertResult);
        res.send({ res: true, message: "Usuario registrado correctamente" });
    } catch(error){
        console.log("Error al ingresar",error)
    }
})

app.post('/chatsUser', async function (req,res) {
    console.log(req.body)
    try{
        const chats = await realizarQuery(`
            SELECT * FROM Chats WHERE id_user = "${req.body.userId}"
            `)
        console.log("Chats encontrados:", chats)
        res.send({
            success: true,
            chats: chats
        })
    } catch(error){
        console.log("Error al traer los chats del usuario", error)
    }
})

app.post('/newChat', async function (req,res) {
    console.log("Datos recibidos: ", req.body)
    try {
        const{userId,mail}=req.body
        console.log("Buscando usuario con mail: ", mail)
        const response = await realizarQuery(`
            SELECT id_user, username FROM Users WHERE mail = "${mail}";
        `);
        if (response.length === 0) {
            console.log("Usuario no encontrado")
            res.send({ res: false, message: "Usuario no encontrado" });
            return;
        }
        const targetUserId = response[0].id_user
        const targetUsername = response[0].username
        console.log("Usuario encontrado")
        //Corroboro que ese usuario no tenga un chat con ese usuario previamente
        const existingChat = await realizarQuery(`
            SELECT id_chat FROM Chats WHERE id_user="${userId}" AND chat_name = "${targetUsername}" AND is_group = "0"
        `);
        if(existingChat.length>0){
            console.log("Chat existente")
            res.send({res:false, message: "Chat existente"})
            return
        }
        const result = await realizarQuery(`
            INSERT INTO Chats (is_group, photo_group, chat_name, id_user) VALUES
            ("0","", "${targetUsername}","${userId}")
        `);
        console.log("Chats creado:", result);
        res.send({ res: true, message: "Chat creado correctamente" });
    } catch(error){
        console.log("Error al crear nuevo chat", error)
        res.send({res: false, message: "Error al crear chat"})
    }
})
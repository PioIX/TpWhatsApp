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


app.post('/findUser', async function (req, res) {
    try {
        const result = await realizarQuery(`
            SELECT * FROM Users WHERE mail = "${req.body.mail}";
        `);
        
        console.log("Resultado de búsqueda:", result);
        if(result.length > 0){
            res.send(true)
        } else {
            res.send(false)
        }
    } catch (error) {
        console.log("Error al buscar usuario:", error);
        res.status(500).send({error: "No se pudo buscar el usuario"});
    }
});

login-back
app.post('/loginUsuarios', async function (req,res) {
    console.log(req.body)
    try{
        const result = await realizarQuery(`
            SELECT * FROM Users WHERE mail = "${req.body.mail}";
        `);

    } catch(error){
        console.log("Error al ingresar",error)
    }
})


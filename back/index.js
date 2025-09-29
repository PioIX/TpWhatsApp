var express = require('express'); //Tipo de servidor: Express
var bodyParser = require('body-parser'); //Convierte los JSON
var cors = require('cors');

const session = require("express-session"); // Para el manejo de las variables de sesión

const { realizarQuery } = require('./modulos/mysql');

var app = express(); //Inicializo express
var port = process.env.PORT || 4000; //Ejecuto el servidor en el puerto 3000

// Convierte una petición recibida (POST-GET...) a objeto JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const server = app.listen(port, function () {
    console.log(`Server running in http://localhost:${port}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

const sessionMiddleware = session({
    secret: "supersarasa",
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

app.get('/', function (req, res) {
    res.status(200).send({
        message: 'GET Home route working fine!'
    });
});

app.get('/users', async function (req, res) {
    let respuesta;
    if (req.query.id_user != undefined) {
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
        respuesta = await realizarQuery(`SELECT * FROM Messages WHERE id_chat=${req.query.id_chat}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM Messages");
    }
    res.send(respuesta);
});

app.get('/usersxchat', async function (req, res) {
    let respuesta;
    if (req.query.id != undefined) {
        respuesta = await realizarQuery(`SELECT * FROM UsersxChat WHERE id_chat_message=${req.query.id}`)
    } else {
        respuesta = await realizarQuery("SELECT * FROM UsersxChat");
    }
    res.send(respuesta);
});

app.post('/addUsers',async function (req, res) {
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

app.post('/messages',async function (req, res) {
    console.log(req.body);
    try {
        if (req.body.photo == undefined || req.body.photo == "") {
            req.body.photo = null;
        }
        const mensaje = await realizarQuery(`
        INSERT INTO Messages (photo, date, id_user, content) VALUES
            (${req.body.photo},'${req.body.date}',${req.body.userId},'${req.body.content}');
        `);
        // const mensajeId = mensaje.insertId;
        // const existingRelation = await realizarQuery(`
        //     SELECT * FROM UsersxChat WHERE id_user = ${req.body.userId} AND id_chat = ${req.body.chatId}
        // `);
        // if (existingRelation.length === 0) {
        //     await realizarQuery(`
        //         INSERT INTO UsersxChat (id_user, id_chat) VALUES
        //         (${req.body.userId},${req.body.chatId});
        //     `);
        // }
        res.send({res:"Mensaje agregado"});
    } catch (error){
        console.log("Error al agregar el mensaje:", error);
        res.status(500).send({res:"No se pudo agregar el mensaje"});
    }
})


app.post('/loginUser', async function (req, res) {
    console.log("Resultado de búsqueda:", req.body);
    try {
        const result = await realizarQuery(`
            SELECT * FROM Users WHERE mail = "${req.body.mail}" AND password = "${req.body.password}";
        `);
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

app.post('/chatsUser', async function(req, res) {
    console.log("Obteniendo chats para usuario:", req.body);
    try {
        const { userId } = req.body;
        
        // Query que devuelve el nombre del OTRO usuario en cada chat
        const chats = await realizarQuery(`
            SELECT 
                c.id_chat,
                c.is_group,
                c.photo_group,
                CASE 
                    WHEN c.is_group = 1 THEN c.chat_name
                    ELSE (
                        SELECT u.username 
                        FROM UsersxChat uc2
                        INNER JOIN Users u ON uc2.id_user = u.id_user
                        WHERE uc2.id_chat = c.id_chat 
                        AND uc2.id_user != ${userId}
                        LIMIT 1
                    )
                END as chat_name,
                (
                    SELECT m.content 
                    FROM Messages m 
                    WHERE m.id_chat = c.id_chat 
                    ORDER BY m.date DESC 
                    LIMIT 1
                ) as last_message,
                (
                    SELECT m.date 
                    FROM Messages m 
                    WHERE m.id_chat = c.id_chat 
                    ORDER BY m.date DESC 
                    LIMIT 1
                ) as last_message_date
            FROM Chats c
            INNER JOIN UsersxChat uc ON c.id_chat = uc.id_chat
            WHERE uc.id_user = ${userId}
            ORDER BY last_message_date DESC
        `);

        console.log("Chats encontrados:", chats);
        res.send({
            res: true,
            chats: chats
        });
    } catch(error) {
        console.log("Error al obtener chats:", error);
        res.send({ res: false, message: "Error al obtener chats" });
    }
});

app.post('/newChat', async function (req,res) {
    console.log("Datos recibidos: ", req.body)
    try {
        const{userId,mail}=req.body
        console.log("Buscando usuario con mail: ", mail)
        const currentUser = await realizarQuery(`
            SELECT mail FROM Users WHERE id_user = "${userId}";
        `);
        if (currentUser.length > 0 && currentUser[0].mail === mail) {
            res.send({ res: false, message: "No puedes crear un chat contigo mismo" });
            return;
        }
        const response = await realizarQuery(`
            SELECT id_user, username FROM Users WHERE mail = "${mail}";
        `);
        if (response.length === 0) {
            console.log("Usuario no encontrado")
            res.send({ res: false, message: "Usuario no encontrado" });
            return;
        }
        const targetUserId = response[0].id_user
        console.log("Usuario encontrado")
        const existingChat = await realizarQuery(`
            SELECT DISTINCT c.id_chat
            FROM Chats c
            INNER JOIN UsersxChat uc1 ON c.id_chat = uc1.id_chat AND uc1.id_user = ${userId}
            INNER JOIN UsersxChat uc2 ON c.id_chat = uc2.id_chat AND uc2.id_user = ${targetUserId}
            WHERE c.is_group = 0
        `);

        if(existingChat.length > 0){
            console.log("Chat ya existe:", existingChat[0])
            res.send({
                res: true,
                message: "Chat encontrado",
                chatId: existingChat[0].id_chat,
                existing: true
            });
            return;
        }

        // CAMBIO: Ya no guardamos chat_name, lo dejamos NULL o vacío
        const result = await realizarQuery(`
            INSERT INTO Chats (is_group, photo_group, chat_name) VALUES
            (0, "", NULL)
        `)
        const chatId = result.insertId;
        await realizarQuery(`
            INSERT INTO UsersxChat (id_user, id_chat) VALUES
            (${userId}, ${chatId}),
            (${targetUserId}, ${chatId})
        `);
        console.log("Chat creado:", chatId);
        res.send({
            res: true,
            message: "Chat creado correctamente",
            chatId: chatId,
            existing: false
        })
    } catch(error){
        console.log("Error al crear nuevo chat", error)
        res.send({res: false, message: "Error al crear chat"})
    }
})

app.post('/chatHistory', async function(req,res) {
    console.log("Datos recibidos para historial:", req.body)
    try{
        const {id_chat, userId} = req.body
        const messages = await realizarQuery(`
                SELECT
                    m.id_message,
                    m.id_chat,
                    m.photo,
                    m.date,
                    m.id_user,
                    m.content,
                    u.username
                FROM Messages m
                INNER JOIN Users u ON m.id_user = u.id_user
                WHERE m.id_chat = ${id_chat}
                AND EXISTS (
                    SELECT 1 FROM UsersxChat uc
                    WHERE uc.id_chat = ${id_chat}
                    AND uc.id_user = ${userId}
                )
                ORDER BY m.date ASC
            `)
        console.log("Mensajes encontrados:", messages)
        res.send({
            res:true,
            messages: messages
        })
    } catch(error){
        console.log("Error al obtener historial del chat:", error)
        res.send({res:false, message: "Error al obtener historial"})
    }
})

io.on("connection", (socket) => {
    const req = socket.request;
    console.log('Usuario conectado:', socket.id);

    socket.on('joinRoom', data => {
        console.log("🚀 ~ io.on ~ req.session.room:", req.session.room)
        if (req.session.room != undefined && req.session.room.length > 0){
            socket.leave(req.session.room);
        }
        req.session.room = data.room;
        socket.join(req.session.room);

        console.log("Usuario se unió a sala:", req.session.room);

        // También unirse a la sala específica del chat
        socket.join(data.room);
        console.log("Usuario también en sala específica:", data.room);

        // Notificar a todos en la sala
        io.to(req.session.room).emit('chat-messages', {
            user: req.session.user,
            room: req.session.room,
            joined: true
        });
    });

    socket.on('pingAll', data => {
        console.log("PING ALL: ", data);
        io.emit('pingAll', { event: "Ping to all", message: data });
    });

    socket.on('sendMessage', (data) => {
		io.to(req.session.room).emit("newMessage", { 
            room: req.session.room, 
            message: data 
        });

        realizarQuery(`
            INSERT INTO Messages (photo, date, id_user, content, id_chat) VALUES
                (${data.photo != undefined ? "" : null},'${data.date}',${data.userId},'${data.content}', '${data.chatId}');
        `);
        const existingRelation = realizarQuery(`
            SELECT * FROM UsersxChat WHERE id_user = ${data.userId} AND id_chat = ${data.chatId}
        `);
        if (existingRelation.length === 0) {
            realizarQuery(`
                INSERT INTO UsersxChat (id_user, id_chat) VALUES
                (${data.userId}, ${data.chatId});
            `);
        }

	});

    socket.on('disconnect', () => {
        console.log("Usuario desconectado:", socket.id);
    })
});

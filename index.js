require('dotenv').config();
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters')
const fs = require('fs');
const axios = require('axios');

//link t.me/bpersonal1_bot (offline)
const bot = new Telegraf(process.env.BOT_TOKEN);

//variable del nombre de la imagen que enviaremos al usuario (guardada en ./assets/imgs/nombre_imagen.jpg)
const imagenAEnviar = "rojo.png";
//descargar imagen que envio el usuario (con ayuda de axios)
const downloadImage = (url, image_path, ctx) =>
    axios({url, responseType: "stream"}).then(
        (response) =>
            new Promise((resolve, reject) => {
                response.data
                    .pipe(fs.createWriteStream(image_path))
                    .on("finish", ()=>{
                        //Se ejecuta si la imagen se guardo exitosamente
                        ctx.reply("Imagen almacenada correctamente");
                        resolve();
                    })
                    .on("error", (e) => {
                        //Se ejecuta si ocurrio un error al guardar la imagen
                        ctx.reply("Ocurrio un eror al almacenar la imagen");
                        reject(e);
                    });
                })
    );

//funcion de numero aleatorio
function random(number){
    return Math.floor(Math.random()*(number + 1));
}
//comando predeterminado /start
bot.start((ctx)=>{
    ctx.reply(`Hola soy BotPersonalV1,
    Creado por William P. Reynoso Alvarez
    Para la clase de Backend I
    > Usa el comando /help para ver los comandos disponibles`);
});
//comando predeterminado /help
bot.help((ctx)=>{
    ctx.reply(`Comandos disponibles:
    /start -> comando de bienvenida.
    /help -> comando de ayuda.
    /random - > devuelve un numero aleatorio entre 0 y 100.
    /newrandom <numero aqui> -> devuelve un numero aleatorio entre 0 y el numero escrito por el usuario.
    /sendphoto -> envia una foto predeterminada que el bot tenga almacenada de forma local.
    >Funciones adicionales:
    - Al recibir un mensaje que contenga una foto esta sera guardada por el bot en el almacenamiento local y ademas el bot respondera si la imagen incluye o no un mensaje de texto.
    - Al recibir un mensaje de texto el bot respondera con el texto que recibio (ignora el texto de los comandos).
    - Al recibir un sticker el bot respondera que recibio un sticker.
    `);
});
//comando personalizado /random para dar un numero al azar entre 0 y 100
bot.command('random', (ctx) => {
    // console.log(ctx);
    ctx.reply(`${random(100)}`);
});
//modificacion del comando random para dar un numero al azar entre 0 y el numero que agregue el usuario
bot.command('newrandom', (ctx) => {
    const message = ctx.update.message.text;
    const randomNumber = Number(message.split(' ')[1]); // /newrandom 9   indice 0 = /newrandom indice 1 = 9
    if(isNaN(randomNumber)||randomNumber <= 0){
        ctx.reply("Por favor escribe un numero valido");
    }
    else{
        ctx.reply(`${random(randomNumber)}`);
    }
});
//comando para enviar foto del almacenamiento local que usa el bot
bot.command('sendphoto', (ctx)=>{
    ctx.replyWithPhoto({source: `./assets/imgs/${imagenAEnviar}`});
});
//manejo de mensajes de tipo texto, en este caso simplemente responder lo que recibimos del usuario
bot.on(message('text'), (ctx)=>{
    // console.log(ctx);
    const msg = ctx.update.message;
    const userInput = msg.text;
    if (userInput.charAt(0) != '/')
        ctx.reply("He recibido un mensaje con el texto: "+userInput);
});
//manejo de mensajes de tipo sticker, simplemente responder que hemos recibido un sticker
bot.on(message('sticker'), (ctx)=>{
    // console.log(ctx);
    ctx.reply("He recibido un mensaje con un sticker 👍");
});
//manejo de mensajes de tipo foto, en este caso: guardar la imagen en el almacenamiento local del bot
bot.on(message('photo'), (ctx)=>{
    // console.log(ctx);
    const image_text = ctx.update.message.caption;
    const photo_array = ctx.update.message.photo;
    const photo_arr_lenght = photo_array.length
    const file_id = photo_array[photo_arr_lenght-1].file_id;
    ctx.telegram.getFileLink(file_id).then((response) =>{
        // console.log(response);
        downloadImage(response.href,`./bot_downloads/imgs/foto_${ctx.update.message.message_id}.jpg`, ctx);
    });
    image_text?
    ctx.reply("He recibido una foto con el texto: "+image_text)
    :
    ctx.reply("He recibido una foto sin texto");
});

//Ejecutar el bot
bot.launch()

// Enable graceful stop (buenas practicas)
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
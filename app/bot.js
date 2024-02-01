const mineflayer = require('mineflayer');
const gui = require("mineflayer-gui");
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const staffs = require('./staffs.json');
const config = require('./config.json');
const requiredConfig = {
    MINECRAFT_SERVER_IP: "l'adresse IP du serveur",
    MINECRAFT_SERVER_VERSION: "la version du serveur",
    MINECRAFT_ALT_RINAORC_PASSWORD: "le mot de passe du bot",
    MINECRAFT_BOT_PSEUDOS: "au moins un pseudo de bot"
};

for (const [key, message] of Object.entries(requiredConfig)) {
    const value = config[key];
    if (!value || (Array.isArray(value) && value.length === 0)) {
        error(`Veuillez renseigner ${message} dans le fichier config.json`);
        process.exit(1);
    }
}

if (staffs.length === 0) {
    error(`Veuillez renseigner au moins un staff dans le fichier staffs.json`);
    process.exit(1);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function success(message) {
    console.log('\x1b[32m%s\x1b[0m', '[✓] ' + message)
}

function error(message) {
    console.log('\x1b[31m%s\x1b[0m', '[✗] ' + message)
}

function info(message) {
    console.log('\x1b[33m%s\x1b[0m', '[!] ' + message)
}

async function main() {
    for (let pseudo of config.MINECRAFT_BOT_PSEUDOS) {
        await createBot(pseudo);
        await sleep(5000);
    }
}

async function createBot(username) {
    let bot = mineflayer.createBot({
        host: config.MINECRAFT_SERVER_IP,
        version: config.MINECRAFT_SERVER_VERSION,
        auth: "offline",
        username: username
    });

    info(`Chargement des plugins pour ${username}...`);
    bot.loadPlugin(pathfinder);
    bot.loadPlugin(gui.plugin);
    success(`Plugins chargés pour ${username} !`);

    bot.once('spawn', async () => {
        success(`Bot ${username} connecté !`);

        const defaultMove = new Movements(bot)
        bot.pathfinder.setMovements(defaultMove)

        success(`Compte connecté : ${bot.username}`)
        /**
         await sleep(2000)
         const scoreboard = JSON.stringify(bot.scoreboard)
         const parsedScoreboard = JSON.parse(scoreboard);
         const lobbyNumber = getLobby(parsedScoreboard)
         info(`Bot connecté au lobby ${lobbyNumber}`)
         **/
    });

    bot.on('message', async message => {
        console.log(message.toAnsi())

        if (message.toString().startsWith('Enregistrez-vous avez: "/register (motdepasse)"')){
            info(`Message d'enregistrement reçu. Enregistrement en cours avec le bot ${username}...`)
            bot.chat('/register ' + config.MINECRAFT_ALT_RINAORC_PASSWORD)
            await sleep(1000)
        }

        if (message.toString().startsWith('Connectez vous avec: "/login (motdepasse)"')){
            info(`Message de connexion reçu. Connexion en cours avec le bot ${username}...`)
            bot.chat('/login ' + config.MINECRAFT_ALT_RINAORC_PASSWORD)
            await sleep(1000)
        }

        if (message.toString().startsWith('⚑ ➥ De')) {
            success(`Message privé reçu sur ${username}.`)
            const messageParts = message.toString().split(' ');
            let playerName = messageParts[3];
            playerName = playerName.slice(0, playerName.length - 1);
            let playerMessage = messageParts.slice(4).join(' ');

            if (playerMessage.startsWith(' ')) {
                playerMessage = playerMessage.slice(1);
            }

            switch (true) {
                case playerMessage.startsWith('!exec'):
                    exec(playerMessage, bot, playerName);
                    break;
            }
        }
        if (message.toString().startsWith('Clan >')) {
            const messageParts = message.toString().split(' ');

            let pseudo = messageParts.find((part) => part.endsWith(':'));
            const indexOfPseudo = messageParts.indexOf(pseudo);

            if (pseudo) {
                pseudo = pseudo.slice(0, pseudo.length - 1);

                let message = messageParts.slice(indexOfPseudo + 1).join(' ');

                if (message.startsWith(' ')) {
                    message = message.slice(1);
                }

                if (message.startsWith('!exec')) {
                    exec(message, bot, pseudo);
                }
            }
        }
    })

bot.on('error', console.error);
bot.on('kicked', console.log);
}

function exec(message, bot, pseudo) {
    const command = message.slice(6);
    if (!checkIfStaff(pseudo)){
        return;
    }

    if (command) {
        bot.chat(command);
    } else {
        bot.whisper(pseudo, 'Aucune intéraction spécifiée.');
    }
}

function getLobby(scoreboard) {
    let itemsMap = scoreboard.sidebar.itemsMap;
    try{
        let lobbyNumber;
        for (let key in itemsMap) {
            if (key.includes("Lobby")) {
                let lobbyItem = itemsMap[key];
                lobbyNumber = lobbyItem.displayName.extra[0].extra[0].text;
                break;
            }
        }
        return lobbyNumber;
    }
    catch (e) {
        error('Impossible de récupérer le lobby');
        return 'unknown';
    }
}

function checkIfStaff(pseudo){
    return !!staffs.includes(pseudo);
}

main().catch(console.error);

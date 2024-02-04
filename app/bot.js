const mineflayer = require('mineflayer');
const gui = require("mineflayer-gui");
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const staffs = require('./staffs.json');
const config = require('./config.json');
const requiredConfig = {
    MINECRAFT_SERVER_IP: "l'adresse IP du serveur",
    MINECRAFT_SERVER_VERSION: "la version du serveur",
    MINECRAFT_ALT_RINAORC_PASSWORD: "le mot de passe du bot",
    MINECRAFT_BOT_PSEUDOS: "au moins un pseudo de bot",
    RINAORC_API_KEY: "la clé API de Rinaorc"
};
const commands = {
    '!exec': exec,
    '!stats': stats,
    '!whereami': whereami
};

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

function handleCommand(message, bot, pseudo) {
    const command = message.split(' ')[0];
    if (commands.hasOwnProperty(command)) {
        return commands[command](message, bot, pseudo);
    } else {
        return 'Commande inconnue.';
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
        console.log(message.toAnsi());
        const messageText = message.toString();

        if (messageText.includes('Connectez vous avec: "/login (motdepasse)"') || messageText.includes('Enregistrez-vous avez: "/register (motdepasse)"')) {
            await handleLogin(messageText, bot, config.MINECRAFT_ALT_RINAORC_PASSWORD);
        }

        const shouldIgnoreMessage = (messageText, botUsername) => {
            return !!(messageText.includes('vient de rejoindre le clan !') ||
                messageText.includes('vient de se faire éjecter du clan.') ||
                !messageText.includes('!') ||
                messageText.endsWith('!')) ||
                messageText === '!';
        };

        if (shouldIgnoreMessage(messageText, bot.username)) return;

        let origin, commandPrefix;
        if (messageText.startsWith('⚑ ➥ De')) {
            origin = `chat`;
            commandPrefix = '';
        } else if (messageText.startsWith('Clan >')) {
            origin = `clan`;
            commandPrefix = '/c c ';
        }

        const {pseudo, playerMessage} = extractSenderAndMessage(messageText, origin);
        if (pseudo === bot.username || !playerMessage.startsWith(`!`)) return;

        const response = await handleCommand(playerMessage, bot, pseudo);
        if (response) {
            if (origin === 'clan') {
                bot.chat(`${commandPrefix}${response}`);
            } else {
                bot.whisper(pseudo, response);
            }
        }
    });


bot.on('error', console.error);
bot.on('kicked', console.log);
}

function verifyConfigAndStaffs() {
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
}

function extractSenderAndMessage(message, origin) {
    if (origin === 'chat') {
        const messageParts = message.toString().split(' ');
        let playerName = messageParts[3];
        playerName = playerName.slice(0, playerName.length - 1);
        let playerMessage = messageParts.slice(4).join(' ');
        return {pseudo: playerName, playerMessage};
    } else if (origin === 'clan') {
        const messageParts = message.toString().split(' ');
        let pseudo = messageParts.find((part) => part.endsWith(':'));
        const indexOfPseudo = messageParts.indexOf(pseudo);
        if (pseudo) {
            pseudo = pseudo.slice(0, pseudo.length - 1);
            let message = messageParts.slice(indexOfPseudo + 1).join(' ');
            if (message.startsWith(' ')) {
                message = message.slice(1);
            }
            return {pseudo, playerMessage: message};
        }
    }
}

async function handleLogin(message, bot, password) {
    console.log('handleLogin', message);
    const command = message.includes('/register') ? '/register ' : '/login ';
    bot.chat(command + password);
    await sleep(1000);
}

async function exec(message, bot, pseudo) {
    if (!checkIfStaff(pseudo)) return;
    const command = message.slice(6);
    if (command) bot.chat(await command);
    else bot.whisper(pseudo, 'Aucune interaction spécifiée.');
}

async function stats(message) {
    const playerToCheck = message.split(' ')[1];
    const regex = /^[a-zA-Z0-9_]+$/;

    if (!playerToCheck || !regex.test(playerToCheck)) {
        return 'Pseudo invalide ou aucun pseudo spécifié. !stats <pseudo>';
    }

    try {
        const results = await Promise.all([
            getPseudo(playerToCheck),
            getFKDR(playerToCheck),
            getWS(playerToCheck),
            getWL(playerToCheck),
            getKD(playerToCheck),
            getStars(playerToCheck),
            getPlayTime(playerToCheck),
        ]);

        const [pseudo, fkdr, ws, wl, kd, stars, playTime] = results;
        const formattedPseudo = pseudo || playerToCheck.slice(0, 16);
        return `${formattedPseudo} : FKDR : ${fkdr || 0} | WS : ${ws || 0} | WL : ${wl || 0} | KD : ${kd || 0} | Stars : ${stars || 0} | Time : ${playTime || 0}`;
    } catch (e) {
        return 'Impossible de récupérer les statistiques de ce joueur.';
    }
}

function whereami(message, bot) {
    let lobby = getLobby(bot.scoreboard);
    return `Je me situe ici : ${lobby}`;
}

function getLobby(scoreboard) {
    let itemsMap = scoreboard.sidebar.itemsMap;

    try {
        const lobbyKey = Object.keys(itemsMap).find(key => key.includes("Lobby"));
        if (lobbyKey) {
            const lobbyItem = itemsMap[lobbyKey];
            return `Lobby principal ${lobbyItem.displayName.extra[0].extra[0].text}`;
        } else {
            const regexAntiColor = /§[a-f0-9klmnor]/gi;
            return scoreboard[1].title.replace(regexAntiColor, '').replaceAll('╸', '').trim();
        }
    } catch (e) {
        console.error('Impossible de récupérer le lobby', e);
        return 'unknown';
    }
}

function checkIfStaff(pseudo){
    return !!staffs.includes(pseudo);
}

async function getPlayerData(pseudo) {
    const rinaorcAPI = `https://api.rinaorc.com/player/${pseudo}`;
    const rinaorcResponse = await fetch(rinaorcAPI, {
        headers: {
            'API-Key': config.RINAORC_API_KEY,
        }
    });

    const rinaorcDATA = await rinaorcResponse.json();

    if (rinaorcDATA.success === false) {
        error(`Impossible de récupérer les données de ${pseudo} : ${rinaorcDATA.error}`)
        return null;
    }

    return rinaorcDATA;
}

async function getFKDR(pseudo) {
    try {
        const playerData = await getPlayerData(pseudo);
        const bw_finalKills_total_all = playerData.player.stats.bedwars.finalKills.total.all || 0;
        if (!playerData.player.stats.bedwars.finalDeaths) return bw_finalKills_total_all;
        const bw_finalDeaths_total_all = playerData.player.stats.bedwars.finalDeaths.total.all || 0;
        if (bw_finalDeaths_total_all === 0) return bw_finalKills_total_all;
        return (bw_finalKills_total_all / bw_finalDeaths_total_all).toFixed(2);
    } catch (e) {
        error(`Impossible de récupérer les données de ${pseudo} (FKDR) : ${e}`);
        return null;
    }
}

async function getWS(pseudo) {
    try {
        const playerData = await getPlayerData(pseudo);
        return playerData.player.games.bedwars.winStreak;
    } catch (e) {
        error(`Impossible de récupérer les données de ${pseudo} (WS) : ${e}`);
        return null;
    }
}

async function getWL(pseudo) {
    try {
        const playerData = await getPlayerData(pseudo);
        const bw_wins_total_all = playerData.player.stats.bedwars.wins.total.all;
        const bw_played_total_all = playerData.player.stats.bedwars.played.total.all;
        const bw_losses_total_all = bw_played_total_all - bw_wins_total_all;
        if (bw_losses_total_all === 0) return bw_wins_total_all;
        return (bw_wins_total_all / bw_losses_total_all).toFixed(2);
    } catch (e) {
        error(`Impossible de récupérer les données de ${pseudo} (WL) : ${e}`);
        return null;
    }
}

async function getKD(pseudo) {
    try {
        const playerData = await getPlayerData(pseudo);
        const bw_kills_total_all = playerData.player.stats.bedwars.kills.total.all;
        const bw_deaths_total_all = playerData.player.stats.bedwars.deaths.total.all;
        return (bw_kills_total_all / bw_deaths_total_all).toFixed(2);
    } catch (e) {
        error(`Impossible de récupérer les données de ${pseudo} (KD) : ${e}`);
        return null;
    }
}

async function getStars(pseudo) {
    try {
        const playerData = await getPlayerData(pseudo);
        return playerData.player.games.bedwars.level;
    } catch (e) {
        error(`Impossible de récupérer les données de ${pseudo} (Stars) : ${e}`);
        return null;
    }
}

async function getPlayTime(pseudo){
    try {
        const playerData = await getPlayerData(pseudo);
        const totalPlayTime = playerData.player.totalPlayedTime;
        const totalHours = totalPlayTime / 3600000;
        const roundedHours = totalHours.toFixed(2);
        return (roundedHours + 'h');
    } catch (e) {
        error(`Impossible de récupérer les données de ${pseudo} (PlayTime) : ${e}`);
        return null;
    }
}

async function getPseudo(pseudo){
    try {
        const playerData = await getPlayerData(pseudo);
        return playerData.player.name;
    } catch (e) {
        error(`Impossible de récupérer les données de ${pseudo} (Pseudo) : ${e}`);
        return null;
    }
}

async function main() {
    verifyConfigAndStaffs();
    for (let pseudo of config.MINECRAFT_BOT_PSEUDOS) {
        await createBot(pseudo);
        await sleep(5000);
    }
}

main().catch(console.error);

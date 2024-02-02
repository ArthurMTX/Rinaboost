<div align="center">

<img src="https://mtx.dev/assets/img/rinaboost.png" alt="Rinaboost logo"> <hr>

**Outil de boost pour le serveur Minecraft Rinaorc**

Ce bot permet de se connecter à plusieurs comptes en même temps et de pouvoir les controller a travers le chat. Il est possible de configurer des comptes a privilèges qui peuvent utiliser des commandes spéciales.

[Installation](#installation) | [Configuration](#configuration) | [Utilisation](#utilisation) | [Contact](#contact)
</div>

<hr>

# Sommaire

- [Prérequis](#prérequis)
- [Installation](#installation)
  - [Manuellement](#manuellement)
  - [Via docker-compose](#via-docker-compose)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
  - [Commandes](#commandes)
- [Disclaimer](#disclaimer)
- [Contact](#contact)

# Prérequis

- Node.js 
- npm
- mineflayer
- mineflayer-pathfinder
- mineflayer-gui
- prismarine-viewer (optionnel)

# Installation

## Manuellement

1. Installer Node.js et npm (https://nodejs.org/)
2. Cloner le dépôt
3. Installer les dépendances avec `npm install`
4. Configurer le fichier `config.json` (voir ci-dessous)
5. Configurer le fichier `staffs.json` (voir ci-dessous)
6. Lancer le bot avec `node bot.js`
7. Arrêter le bot avec `Ctrl + C`

## Via docker-compose

1. Installer Docker et Docker Compose (https://docs.docker.com/get-docker/)
2. Cloner le dépôt
3. Configurer le fichier `config.json` (voir ci-dessous)
4. Configurer le fichier `staffs.json` (voir ci-dessous)
5. Lancez le bot avec `docker compose up -d`
6. Accédez aux logs avec `docker compose logs -f`
7. Arrêtez le bot avec `docker compose down`

# Configuration

## Configurations générales

Il est possible de configurer le bot dans le fichier `config.json`. Il est obligatoire de renseigner l'adresse IP du serveur Minecraft, la version du serveur Minecraft, le mot de passe Rinaorc pour les bots et les pseudos des bots.

Configuration d'exemple pour le fichier `config.json` :

```json
{
  "MINECRAFT_SERVER_IP" : "play.rinaorc.com",
  "MINECRAFT_SERVER_VERSION" : "1.8.9",
  "MINECRAFT_ALT_RINAORC_PASSWORD" : "m0td3p4ss3",
  "MINECRAFT_BOT_PSEUDOS" : [
    "Bot1",
    "Bot2"
  ]
}
```

## Configurations des staffs

Les staffs sont des comptes a privilèges qui peuvent utiliser des commandes spéciales. Il est possible de les ajouter dans le fichier `staffs.json`. Il est obligatoire d'en ajouter au moins un.

Configuration d'exemple pour le fichier `staffs.json` :

```json
[
  "Staff1",
  "Staff2"
]
```

# Utilisation

## Commandes
...

# Disclaimer

Ce projet est à but éducatif et ne doit pas être utilisé pour nuire à autrui. 
L'utilisation de bots est interdite sur le serveur Minecraft Rinaorc et peut entraîner des sanctions sur les comptes utilisés et sur l'adresse IP ([Règlement de Rinaorc](https://rules.rinaorc.com/)).\
L'auteur de ce projet n'est en aucun cas responsable de l'utilisation qui en est faite.

Amusez vous mais ne pétez pas tout :)

# Contact

Mitralyx/ArthurMTX - [@MitralyxL](https://twitter.com/MitralyxL) - amtxl@pm.me

Discord : mmtx

GitHub : [https://github.com/arthurmtx/rinaboost](https://github.com/arthurmtx/rinaboost)


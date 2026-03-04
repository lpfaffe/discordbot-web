require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Bot Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// Collections für Commands
client.commands = new Collection();
client.cooldowns = new Collection();

// DisTube für Musik (v5 API)
client.distube = new DisTube(client, {
  plugins: [new YtDlpPlugin({ update: false })],
  emitNewSongOnly: true,
});

// Anti-Spam Map
client.spamMap = new Map();

// Command Handler
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;
  const commandFiles = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(folderPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }
}

// Event Handler
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// MongoDB verbinden
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB verbunden');
  } catch (error) {
    console.error('❌ MongoDB Verbindungsfehler:', error);
    process.exit(1);
  }
}

// Bot API starten (damit Webseite mit Bot kommunizieren kann)
const botApi = require('./api/botApi');

// Client exportieren (für botApi.js)
module.exports = { client };

// Start
async function start() {
  await connectDB();

  const port = process.env.BOT_API_PORT || 3002;
  const server = botApi.listen(port, '127.0.0.1', () => {
    console.log(`🤖 Bot API läuft auf Port ${port}`);
  });
  server.on('error', err => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} bereits belegt – Bot-API läuft möglicherweise bereits.`);
    } else {
      console.error('Bot API Fehler:', err);
    }
  });

  await client.login(process.env.DISCORD_TOKEN);
}

// Commands automatisch beim Start registrieren
async function deployCommands() {
  // Routes kommt aus discord.js, REST aus @discordjs/rest
  const { REST } = require('@discordjs/rest');
  const { Routes } = require('discord.js');

  const commands = [];
  const cmdPath = path.join(__dirname, 'commands');
  for (const folder of fs.readdirSync(cmdPath)) {
    const fp = path.join(cmdPath, folder);
    if (!fs.statSync(fp).isDirectory()) continue;
    for (const file of fs.readdirSync(fp).filter(f => f.endsWith('.js'))) {
      try {
        const cmd = require(path.join(fp, file));
        if (cmd?.data) commands.push(cmd.data.toJSON());
      } catch(e) { console.warn(`⚠️ Command-Fehler ${file}:`, e.message); }
    }
  }

  if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
    console.error('❌ DISCORD_TOKEN oder DISCORD_CLIENT_ID fehlt in .env!');
    return;
  }

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    console.log(`✅ ${commands.length} Slash-Commands global registriert!`);
  } catch(e) {
    console.error('❌ Command-Registrierung fehlgeschlagen:', e.message);
  }
}

start().then(() => {
  // clientReady statt ready (ready ist deprecated in discord.js v14+)
  client.once('clientReady', () => {
    deployCommands().catch(console.error);
  });
}).catch(console.error);

// Verhindert kompletten Crash bei unbehandelten Fehlern
process.on('unhandledRejection', err => console.error('⚠️ Unhandled Rejection:', err));
process.on('uncaughtException', err => console.error('⚠️ Uncaught Exception:', err));


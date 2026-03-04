require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const path = require('path');
const fs = require('fs');

if (!process.env.DISCORD_TOKEN || !process.env.DISCORD_CLIENT_ID) {
  console.error('❌ DISCORD_TOKEN oder DISCORD_CLIENT_ID fehlt in .env!');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

for (const folder of fs.readdirSync(commandsPath)) {
  const folderPath = path.join(commandsPath, folder);
  if (!fs.statSync(folderPath).isDirectory()) continue;
  for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
    try {
      const command = require(path.join(folderPath, file));
      if (command?.data) commands.push(command.data.toJSON());
    } catch(e) {
      console.warn(`⚠️ Überspringe ${file}: ${e.message}`);
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`📤 Registriere ${commands.length} Slash-Commands...`);
    await rest.put(
      Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
      { body: commands }
    );
    console.log('✅ Commands erfolgreich registriert!');
    commands.forEach(c => console.log(`   /${c.name}`));
  } catch (error) {
    console.error('❌ Fehler:', error.message);
  }
})();

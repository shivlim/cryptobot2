const dotenv = require('dotenv');
const { Client, RichEmbed } = require('discord.js');
dotenv.config();

// wait event function
const waitEvent = (emitter, status) => new Promise((resolve) => emitter.on(status, resolve));

(async() => {
    // my discord account token
    const token = process.env.TOKEN;  /* my account */
    const bot_token = process.env.BOT_TOKEN;  /* my account */
    const src_name = process.env.SRC_NAME;
    const dst_name = process.env.DST_NAME;
    const src_channel_names = process.env.CHANNEL_NAMES.split(' ');
    const me = new Client();
    const bot = new Client();
    
    me.login(token); /* login */
    await waitEvent(me, 'ready'); /* wait for login */
    console.log('Logged as @me')
    bot.login(bot_token); /* login */
    await waitEvent(bot, 'ready'); /* wait for login */
    console.log('Logged as @bot')
    
    const itsme = me.user.id; /* get user id */
    const guild_names = {};
    const dst_ids = {};

    // get Guilds IDs & Channels IDs
    me.guilds.filter(u => ([src_name, dst_name].includes(u.name))).map(u => {guild_names[u.name] = u.id;});

    const guild = await bot.guilds.get(guild_names[dst_name]);

    guild.channels.filter(c => src_channel_names.includes(c.name)).map(c => { dst_ids[c.name] = c.id });
    
    me.on('message', async(msg) => {
        if (msg.author.id === itsme || (msg.guild && msg.guild.name !== src_name)) return;
        if (!src_channel_names.includes(msg.channel.name)) return;
        
        if (msg.channel.name in dst_ids) {
            const reply_channel = await guild.channels.get(dst_ids[msg.channel.name]);

            let content = msg.content;
            let options = {}

            if (msg.embeds.length > 0) {
                options.embed =  msg.embeds[0];
            }

            let attachments = (msg.attachments).array();

            if (attachments.length > 0) {
                attachments = attachments.map(att => att.url);
                options.files = attachments;
            }

            if (content !== '') {
                await reply_channel.send(content, options)
            } else {
                await reply_channel.send(options)
            }
        }
    });
})();
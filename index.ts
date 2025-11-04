import {
	Client,
	GatewayIntentBits,
	EmbedBuilder,
	SlashCommandBuilder,
	Events,
	Collection,
	REST,
	Routes,
	MessageFlags,
} from "discord.js";
import { ofetch } from "ofetch";

const TOKEN = Bun.env.DISCORD_TOKEN;
const PREFIX = Bun.env.PREFIX ?? "/";
const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const DANBOORU_API_KEY = Bun.env.DANBOORU_API_KEY;
if (!TOKEN) {
	console.error(
		"Missing DISCORD_TOKEN in environment. Create a .env with DISCORD_TOKEN=your_token",
	);
	process.exit(1);
}
if (!DANBOORU_API_KEY) {
	console.error(
		"Missing DANBOORU_API_KEY in environment. Create a .env with DANBOORU_API_KEY=your_api_key",
	);
	process.exit(1);
}

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

async function loadImage() {
	const endpoint =
		"https://danbooru.donmai.us/posts/random.json?tags=yi_sang_(project_moon) 1boy&rating=s";
	const data = await ofetch<{ large_file_url: string; source: string }>(
		endpoint,
		{
			headers: {
				"User-Agent": "yisang-bot/1.0 (https://example.com)",
				Authorization: `Basic ${DANBOORU_API_KEY}`,
			},
			timeout: 10000,
		},
	);
	return { file: data.large_file_url, source: data.source };
}
let lastUsed: number | null = null; // global cooldown timestamp

client.once("clientReady", () => {
	console.log(`Logged in as ${client.user?.tag}`);
});

const commands = new SlashCommandBuilder()
	.setName("yisang")
	.setDescription("Yi Sang");

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.commandName === "yisang") {
		try {
			const now = Date.now();
			if (lastUsed && now - lastUsed < COOLDOWN_MS) {
				const left = Math.ceil((COOLDOWN_MS - (now - lastUsed)) / 1000);
				await interaction.reply({
					content: `Please wait ${left}s before using this command again (global cooldown).`,
					flags: MessageFlags.Ephemeral,
				});
				return;
			}

			// Fetch a random SFW post from Danbooru
			const post = await loadImage();

			const embed = new EmbedBuilder()
				.setTitle("Yisang น่ารักที่สุดในโลกอันดับ 1 🥰")
				.setImage(post.file)
				.setURL(post.source)
				.setFooter({ text: `Requested by ${interaction.user.tag}` })
				.setColor(0x00ae86);

			await interaction.reply({ embeds: [embed] });
			lastUsed = Date.now();
		} catch (err: any) {
			console.error(`Error handling ${PREFIX}yisang:`, err?.stack ?? err);
			try {
				await interaction.reply({
					content: "น้องปรีไม่สามารถเขียน Code ที่มีประสิทธิภาพได้ 😔",
					flags: MessageFlags.Ephemeral,
				});
			} catch (_) {
				// ignore
			}
		}
	}
});

(client as any).commands = new Collection();

(client as any).commands.set(commands.name, commands);

client.login(TOKEN).catch((err) => {
	console.error("Failed to login to Discord:", err);
	process.exit(1);
});

const rest = new REST().setToken(TOKEN);

(async () => {
	try {
		const data = await rest.put(
			Routes.applicationGuildCommands(
				"1435223646439211048",
				"1064143038802297002",
			),
			{ body: (client as any).commands.map((cmd: any) => cmd.toJSON()) },
		);
	} catch (error) {
		console.error(error);
	}
})();

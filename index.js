const {
    default: makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");

const Pino = require("pino");
const qr = require("qr-terminal");

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        logger: Pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: state,
        version
    });

    // QR keluar di console panel
    sock.ev.on("connection.update", (update) => {
        if (update.qr) {
            qr.generate(update.qr, { small: true });
            console.log("\nSCAN QR KAMU DI SINI!\n");
        }
        if (update.connection === "open") {
            console.log("BOT BERHASIL TERHUBUNG ✔️");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // Handle pesan masuk
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0];
        const from = m.key.remoteJid;

        let text =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            "";

        // MENU
        if (text.toLowerCase() === "menu") {
            await sock.sendMessage(from, {
                text: "📋 *E-Store Menu*\nKlik tombol di bawah.",
                footer: "Liviaaa Store",
                title: "Pilih layanan",
                buttonText: "📦 Buka Menu",
                sections: [
                    {
                        title: "📌 PRODUK",
                        rows: [
                            { title: "🔥 Bot WhatsApp", rowId: "botwa" },
                            { title: "🚀 Panel Bot", rowId: "panel" },
                            { title: "💳 QRIS Payment", rowId: "qris" }
                        ]
                    },
                    {
                        title: "⚙️ LAYANAN",
                        rows: [
                            { title: "👤 Hubungi Admin", rowId: "admin" },
                            { title: "ℹ️ Cara Order", rowId: "order" }
                        ]
                    }
                ]
            });
        }

        // RESPON
        if (text === "botwa") {
            return sock.sendMessage(from, {
                text:
                    "🔥 *Bot WhatsApp*\n" +
                    "Harga: 10k – 50k\n" +
                    "Fitur: Auto Menu, Payment, Button, Detect QRIS"
            });
        }

        if (text === "panel") {
            return sock.sendMessage(from, {
                text:
                    "🚀 *Panel Bot*\n1GB = 1k\n4GB = 3k\n5GB = 5k\n10GB = 9k\nUNLI = 10k"
            });
        }

        if (text === "qris") {
            await sock.sendMessage(from, {
                text: "💳 Silahkan scan QRIS berikut:"
            });
            return sock.sendMessage(from, {
                image: { url: "https://img1.pixhost.to/images/10438/664840560_andre.jpg" },
                caption: "QRIS Payment"
            });
        }

        if (text === "order") {
            return sock.sendMessage(from, {
                text:
                    "📘 *Cara Order*\n" +
                    "1. Pilih produk\n" +
                    "2. Lakukan pembayaran via QRIS\n" +
                    "3. Kirim bukti transfer\n" +
                    "4. Order diproses otomatis ✔️"
            });
        }

        if (text === "admin") {
            return sock.sendMessage(from, {
                text: "👤 Admin: wa.me/62XXXXXXXX"
            });
        }
    });
}

start();

import dotenv from "dotenv";
dotenv.config();
import amqplib from "amqplib";

let channel;

export async function connectLavinMQ() {
    try {
        const connection = await amqplib.connect(process.env.LAVINMQ_UR);
        channel = await connection.createChannel();
        await channel.assertExchange("ticket_created", "direct", { durable: true });

        console.log("Conectado a LavinMQ");
    } catch (err) {
        console.error("Error al conectar a LavinMQ:", err.message);
        throw err;
    }
}

export function getChannel() {
    if (!channel) throw new Error("LavinMQ no está conectado");
    return channel;
}


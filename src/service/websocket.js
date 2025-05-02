import { WebSocketServer } from "ws";
import { getChannel } from "../configuration/lavinmq.js";
import { master } from "../configuration/connection.js";

const clients = new Map();

export async function initWebSocketAndConsume() {
    const channel = getChannel();

    await channel.assertExchange("ticket_created", "direct", { durable: true });
    await channel.assertQueue("ticket_created_queue", { durable: true });
    await channel.bindQueue("ticket_created_queue", "ticket_created", "");

    const wss = new WebSocketServer({ port: 5601 });

    wss.on("connection", (ws) => {
        console.log("Cliente WebSocket conectado");

        ws.on("message", async (message) => {
            try {
                const data = JSON.parse(message);
                console.log(data)

                if (data.type === "register") {
                    const { user_id } = data;
                    clients.set(user_id, ws);
                    console.log(`Usuario registrado al WebSocket: ${user_id}`);

                    const result = await master.query(
                        `SELECT id, title, message, created_at FROM sige.notifications 
                         WHERE user_id = $1 AND read = false
                         ORDER BY created_at DESC`,
                        [user_id]
                    );

                    ws.send(JSON.stringify({
                        type: "history",
                        notifications: result.rows,
                    }));
                }

                else if (data.type === "delete_notification") {
                    const { id_notification, user_id } = data;

                    await master.query(
                        `UPDATE sige.notifications SET read = true WHERE id = $1 AND user_id = $2`,
                        [id_notification, user_id]
                    );

                    console.log(`Notificación ${id_notification} eliminada para el usuario ${user_id}`);

                    const result = await master.query(
                        `SELECT id, title, message, created_at FROM sige.notifications 
                         WHERE user_id = $1 AND read = false
                         ORDER BY created_at DESC`,
                        [user_id]
                    );

                    ws.send(JSON.stringify({
                        type: "history",
                        notifications: result.rows,
                    }));
                }

            } catch (err) {
                console.error("Error al procesar mensaje WebSocket:", err.message);
            }
        });

        ws.on("close", () => {
            for (const [uid, socket] of clients.entries()) {
                if (socket === ws) {
                    clients.delete(uid);
                    console.log(`Usuario desconectado del WebSocket: ${uid}`);
                }
            }
        });
    });

    channel.consume("ticket_created_queue", async (msg) => {
        if (msg !== null) {
            try {
                const content = JSON.parse(msg.content.toString());
                const { user_id, message, title } = content;

                await master.query(
                    `INSERT INTO sige.notifications (user_id, title, message) VALUES ($1, $2, $3)`,
                    [user_id, title, message]
                );

                console.log(`Notificación guardada para el usuario ${user_id}`);
                sendNotificationToUser(user_id, content);
                channel.ack(msg);
            } catch (err) {
                console.error("Error al procesar mensaje:", err.message);
            }
        }
    });
}

export function sendNotificationToUser(user_id, data) {
    const socket = clients.get(user_id);
    if (socket && socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({
            type: "new_notification",
            notification: data
        }));
        console.log(`Notificación enviada a ${user_id}`);
    } else {
        console.log(`Usuario ${user_id} no está conectado`);
    }
}
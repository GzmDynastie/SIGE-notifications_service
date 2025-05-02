// import { connectLavinMQ } from "./configuration/lavinmq.js";
// import { initWebSocketAndConsume } from "./service/websocket.js";

// (async () => {
//     await connectLavinMQ();
//     await initWebSocketAndConsume();
// })();


import http from "http";
import { connectLavinMQ } from "./configuration/lavinmq.js";
import { initWebSocketAndConsume } from "./service/websocket.js";

// Si no usas Express, puedes usar directamente un servidor básico
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end("WebSocket server is running");
});

(async () => {
    await connectLavinMQ();
    await initWebSocketAndConsume(server);

    const PORT = process.env.PORT || 5601;
    server.listen(PORT, () => {
        console.log(`Servidor HTTP+WebSocket escuchando en puerto ${PORT}`);
    });
})();

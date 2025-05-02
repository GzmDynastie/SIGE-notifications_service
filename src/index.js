import { connectLavinMQ } from "./configuration/lavinmq.js";
import { initWebSocketAndConsume } from "./service/websocket.js";

(async () => {
    await connectLavinMQ();
    await initWebSocketAndConsume();
})();
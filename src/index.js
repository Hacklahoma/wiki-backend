require("dotenv").config({ path: ".env" });
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();

server.express.get("/auth", (req, res) => {
    console.log("Authenticated");
    res.redirect(process.env.FRONTEND_URL);
});

server.start(
    {
        cors: {
            credentials: true,
            origin: process.env.FRONTEND_URL,
        },
    },
    deets => {
        console.log(`Server is now running on port http://localhost:${deets.port}`);
    }
);

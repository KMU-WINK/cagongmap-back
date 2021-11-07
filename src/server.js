require("dotenv").config();
import mongoose from "mongoose";
import {
    createServer,
} from "http";
import {
    app,
} from "./app";


// env returns String value or undefined
const port = parseInt(process.env.PORT || "80") || 80;

// server aware its mode
const mode = process.env.MODE || "start";

const mongooseOption = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

let dbConnection = null;
let httpServer = null;

// use it like main function
const bootstrap = async () => {
    dbConnection = await mongoose.connect(process.env.DB, mongooseOption);
    httpServer = createServer(app);
    httpServer.listen(port, () => {
        console.info(`The application started at ${port}.`);
    });
};


// gracefully shutdown
const shutdown = async (
    signal,
) => {
    if (dbConnection != null) {
        await connection.disconnect();
    }
    httpServer.close();

    // double check for process kill 
    process.kill(process.pid, signal);
    process.exit();
}

// binding signal when not 'dev' mode
if (mode !== 'dev') {
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
    process.once("SIGQUIT", shutdown);
    process.once("SIGUSR2", shutdown);
}

// error try catch all error for bootstrap
bootstrap().catch((e) => {
    console.error(e);
});


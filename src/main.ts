import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

const { PORT } = process.env;
const LOCALHOST_IP = "0.0.0.0";

async function bootstrap() {
    const logger = new Logger(bootstrap.name);
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.enableCors({
        origin: [
            "http://localhost:3000",
            "https://todo-proj-93os08ad1-wallodya.vercel.app",
            "https://todo-proj-5e09tdmgm-wallodya.vercel.app",
        ],
        exposedHeaders: ["Authorization"],
        allowedHeaders: [
            "Authorization",
            "authorization",
            "Content-Type",
            "Origin",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true,
    });
    await app.listen(PORT, LOCALHOST_IP);
    logger.log(`App is listening on ${LOCALHOST_IP}:${PORT}`);
}
bootstrap();

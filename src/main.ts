import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

const { PORT } = process.env;
const LOCALHOST_IP = "0.0.0.0";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    await app.listen(PORT, LOCALHOST_IP);
}
bootstrap();

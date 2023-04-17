import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TaskModule } from "./task/task.module";
import { QuestModule } from "./quest/quest.module";
import { TokenModule } from "./token/token.module";
import { ScheduleModule } from "@nestjs/schedule";
import { RolesModule } from "./roles/roles.module";
import { JwtAuthGuard } from "auth/guards/jwt.guard";
import { APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "roles/guards/roles.guard";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import * as path from "path";

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `env/.${process.env.NODE_ENV}.env`,
        }),
        ServeStaticModule.forRoot({
            rootPath: path.resolve(__dirname, "static"),
        }),
        UserModule,
        AuthModule,
        TaskModule,
        QuestModule,
        TokenModule,
        ScheduleModule.forRoot(),
        RolesModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}

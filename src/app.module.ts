import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TaskModule } from "./task/task.module";
import { QuestModule } from "./quest/quest.module";
import { TokenModule } from './token/token.module';

@Module({
    imports: [UserModule, AuthModule, TaskModule, QuestModule, TokenModule],
})
export class AppModule {}

import { Controller, Delete, Post } from "@nestjs/common";

@Controller("task")
export class TaskController {
    @Post()
    createTask() {
        return;
    }
    @Post("complete")
    completeTask() {
        return;
    }
    @Delete()
    deleteTask() {
        return;
    }
}

import { Test, TestingModule } from "@nestjs/testing";
import { QuestController } from "./quest.controller";

describe("QuestController", () => {
    let controller: QuestController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [QuestController],
        }).compile();

        controller = module.get<QuestController>(QuestController);
    });

    it("should be defined", () => {
        expect(controller).toBeDefined();
    });
});

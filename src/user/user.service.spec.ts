import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma.service";
import { UserService } from "./user.service";

const testUser = {
    uuid: "abcd",
    login: "test_user",
    email: "test@test.com",
    isEmailConfirmed: false,
    dateOfBirth: null,
    createdAt: new Date("2022-12-27T15:11:43.711Z"),
    updatedAt: new Date("2022-12-27T00:00:00.000Z"),
};

describe("UserService", () => {
    let service: UserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [UserService, PrismaService],
        }).compile();

        service = module.get<UserService>(UserService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
        expect(service.getAllUsers).toBeDefined();
        expect(service.getUserByEmail).toBeDefined();
        expect(service.getUserByLogin).toBeDefined();
        expect(service.getUserByUUID).toBeDefined();
        expect(service.createUser).toBeDefined();
        expect(service.deleteUser).toBeDefined();
    });

    it("allUsers method should return an array", async () => {
        const res = await service.getAllUsers();
        expect(Array.isArray(res)).toBe(true);
    });

    it("getUserByUUID should return user", async () => {
        const res = await service.getUserByUUID("abcd");
        expect(res).toEqual(testUser);
    });

    it("getUserByEmail should return user", async () => {
        const res = await service.getUserByEmail("test@test.com");
        expect(res).toEqual(testUser);
    });
    it("getUserByLogin should return user", async () => {
        const res = await service.getUserByLogin("test_user");
        expect(res).toEqual(testUser);
    });
});

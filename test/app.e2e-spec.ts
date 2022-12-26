import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";

describe("All endpoints are defined (e2e)", () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    it("/user (GET)", () => {
        return request(app.getHttpServer()).get("/user").expect(200);
    });

    it("/auth/login (POST)", () => {
        return request(app.getHttpServer()).post("/auth/login").expect(201);
    });

    it("/auth/logout (POST)", () => {
        return request(app.getHttpServer()).post("/auth/logout").expect(201);
    });

    it("/auth/register (POST)", () => {
        return request(app.getHttpServer()).post("/auth/register").expect(201);
    });

    it("/auth/refresh (GET)", () => {
        return request(app.getHttpServer()).get("/auth/refresh").expect(200);
    });

    it("/auth/activate (GET)", () => {
        return request(app.getHttpServer())
            .get("/auth/activate/:confirmCode")
            .expect(200);
    });

    it("/task (POST)", () => {
        return request(app.getHttpServer()).post("/task").expect(201);
    });

    it("/task (DELETE)", () => {
        return request(app.getHttpServer()).delete("/task").expect(200);
    });

    it("/task/complete (POST)", () => {
        return request(app.getHttpServer()).post("/task/complete").expect(201);
    });

    it("/quest (GET)", () => {
        return request(app.getHttpServer()).get("/quest").expect(200);
    });
    it("/quest (POST)", () => {
        return request(app.getHttpServer()).post("/quest").expect(201);
    });
    it("/quest/start (POST)", () => {
        return request(app.getHttpServer()).post("/quest/start").expect(201);
    });
    it("/quest/complete (POST)", () => {
        return request(app.getHttpServer()).post("/quest/complete").expect(201);
    });
    it("/quest (DELETE)", () => {
        return request(app.getHttpServer()).delete("/quest").expect(200);
    });
});

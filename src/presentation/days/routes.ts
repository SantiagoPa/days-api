import { Router } from "express";
import { DasyController } from "./controller";
import { DaysDatasourceImpl } from "../../infrastructure/datasource/days.datasource.impl";
import { DaysRepositoryImpl } from "../../infrastructure/repositories/days.repository.impl";

export class DaysRoutes {
    static get routes(): Router {
        const router = Router();
        const datasource = new DaysDatasourceImpl();
        const daysRepository = new DaysRepositoryImpl(datasource);
        const daysController = new DasyController(daysRepository);

        router.get("/sum-days", daysController.getSumDay);

        return router;
    }
}
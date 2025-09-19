import { Router } from "express";
import { DaysRoutes } from "./days/routes";

export class AppRoutes {
    static get routes(): Router {
        const  router = Router();
        
        router.use("/api/days", DaysRoutes.routes);

        return router;
    }
}
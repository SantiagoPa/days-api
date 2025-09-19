import type { Request, Response } from "express";
import { QueryParamsDto } from "../../domain/dtos/days/queryParams.dto";
import { DaysRepository, SumDays } from "../../domain";

export class DasyController {

    constructor(
        private readonly daysRepository: DaysRepository
    ){}

    getSumDay = (req: Request, res: Response) => {
        const [error, queryParamsDto] = QueryParamsDto.create( req.query );

        if (error) return res.status(400).json({ error: "InvalidParameters", message: error });
        
        new SumDays(this.daysRepository)
            .execute(queryParamsDto!)
            .then((resp)=> res.json(resp) )
            .catch(()=> res.status(400).json({error: "ErrorCalculateDate", message: "Error al momento de calcular la fecha"}));
    }

}
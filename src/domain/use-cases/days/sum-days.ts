import { QueryParamsDto } from "../../dtos/days/queryParams.dto";
import { DaysEntity } from "../../entities/days.entity";
import { DaysRepository } from "../../repositories/days.repository";

export interface SumDaysUseCase {
    execute( queryParamsDto: QueryParamsDto ): Promise<DaysEntity>; 
}

export class SumDays implements SumDaysUseCase {

    constructor(
        private readonly repository: DaysRepository,
    ) {}

    execute(queryParamsDto: QueryParamsDto): Promise<DaysEntity> {
        return this.repository.sumDays(queryParamsDto);
    }

}
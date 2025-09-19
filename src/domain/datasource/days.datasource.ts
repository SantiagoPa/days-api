import { QueryParamsDto } from "../dtos/days/queryParams.dto";
import { DaysEntity } from "../entities/days.entity";

export abstract class DaysDatasource {
    abstract sumDays( queryParamsDto: QueryParamsDto ): Promise<DaysEntity>;
}
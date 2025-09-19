import { DaysDatasource, DaysEntity, DaysRepository, QueryParamsDto } from "../../domain";

export class DaysRepositoryImpl implements DaysRepository {

    constructor(
        private readonly datasource: DaysDatasource
    ){}

    sumDays(queryParamsDto: QueryParamsDto): Promise<DaysEntity> {
        return this.datasource.sumDays(queryParamsDto);
    }

}
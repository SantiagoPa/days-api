import { DateTime } from "luxon";

export class DaysEntity {
    constructor(
        public date: string
    ){}

    public static fromJson( date: DateTime ): DaysEntity{
        const result = date.toUTC();
        return new DaysEntity(result.toISO() as string);
    }
    
}
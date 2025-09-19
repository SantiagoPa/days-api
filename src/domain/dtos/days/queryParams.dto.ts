// dependencia oculta

import { DateTime } from "luxon";

export class QueryParamsDto {

    constructor(
        public readonly date?: DateTime,
        public readonly days?: number,
        public readonly hours?: number,

    ) { };


    static create(query: { [key: string]: any }): [string | undefined, QueryParamsDto?] {

        if (!query.date && !query.days && !query.hours) return ["Debe enviar al menos un campo de los siguientes, 'date', 'days', 'hours'"];

        const result: { days?: number; hours?: number; date?: DateTime } = {};

        // Validar days
        if (query.days !== undefined) {
            const days = parseInt(query.days, 10);
            if (isNaN(days) || days < 0) {
                return ["El campo 'days' debe ser un entero positivo"];
            }
            result.days = days;
        }

        // Validar hours
        if (query.hours !== undefined) {
            const hours = parseInt(query.hours, 10);
            if (isNaN(hours) || hours < 0) {
                return ["El campo 'hours' debe ser un entero positivo"];
            }
            result.hours = hours;
        }

        // Validar date
        if (query.date !== undefined) {

            const date = DateTime.fromISO(query.date, { zone: 'utc' });
            if (!date.isValid) {
                return ["El campo 'date' debe ser una fecha válida en formato ISO 8601 con sufijo 'Z'"];
            }
            result.date = date;
        }

        return [undefined, new QueryParamsDto(result.date, result.days, result.hours)];

    }

}
import { DateTime } from 'luxon';
import { DaysDatasource, DaysEntity, QueryParamsDto } from "../../domain";


// Constantes
const COLOMBIA_TIMEZONE = 'America/Bogota';
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 17;
const LUNCH_START_HOUR = 12;
const LUNCH_END_HOUR = 13;
const WORK_DAYS = [1, 2, 3, 4, 5]; // Lunes a viernes

const COLOMBIAN_HOLIDAYS: string[] = [
    "2025-01-01",
    "2025-01-06",
    "2025-03-24",
    "2025-04-17",
    "2025-04-18",
    "2025-05-01",
    "2025-06-02",
    "2025-06-23",
    "2025-06-30",
    "2025-08-07",
    "2025-08-18",
    "2025-10-13",
    "2025-11-03",
    "2025-11-17",
    "2025-12-08",
    "2025-12-25",
    "2026-01-01",
    "2026-01-12",
    "2026-03-23",
    "2026-04-02",
    "2026-04-03",
    "2026-05-01",
    "2026-05-18",
    "2026-06-08",
    "2026-06-15",
    "2026-06-29",
    "2026-07-20",
    "2026-08-07",
    "2026-08-17",
    "2026-10-12",
    "2026-11-02",
    "2026-11-16",
    "2026-12-08",
    "2026-12-25",
    "2027-01-01",
    "2027-01-11",
    "2027-03-22",
    "2027-03-25",
    "2027-03-26",
    "2027-05-10",
    "2027-05-31",
    "2027-06-07",
    "2027-07-05",
    "2027-07-20",
    "2027-08-16",
    "2027-10-18",
    "2027-11-01",
    "2027-11-15",
    "2027-12-08",
    "2028-01-10",
    "2028-03-20",
    "2028-04-13",
    "2028-04-14",
    "2028-05-01",
    "2028-05-29",
    "2028-06-19",
    "2028-06-26",
    "2028-07-03",
    "2028-07-20",
    "2028-08-07",
    "2028-08-21",
    "2028-10-16",
    "2028-11-06",
    "2028-11-13",
    "2028-12-08",
    "2028-12-25",
    "2029-01-01",
    "2029-01-08",
    "2029-03-19",
    "2029-03-29",
    "2029-03-30",
    "2029-05-01",
    "2029-05-14",
    "2029-06-04",
    "2029-06-11",
    "2029-07-02",
    "2029-07-20",
    "2029-08-07",
    "2029-08-20",
    "2029-10-15",
    "2029-11-05",
    "2029-11-12",
    "2029-12-25",
    "2030-01-01",
    "2030-01-07",
    "2030-03-25",
    "2030-04-18",
    "2030-04-19",
    "2030-05-01",
    "2030-06-03",
    "2030-06-24",
    "2030-07-01",
    "2030-08-07",
    "2030-08-19",
    "2030-10-14",
    "2030-11-04",
    "2030-11-11",
    "2030-12-25",
    "2031-01-01",
    "2031-01-06",
    "2031-03-24",
    "2031-04-10",
    "2031-04-11",
    "2031-05-01",
    "2031-05-26",
    "2031-06-16",
    "2031-06-23",
    "2031-06-30",
    "2031-08-07",
    "2031-08-18",
    "2031-10-13",
    "2031-11-03",
    "2031-11-17",
    "2031-12-08",
    "2031-12-25",
    "2032-01-01",
    "2032-01-12",
    "2032-03-22",
    "2032-03-25",
    "2032-03-26",
    "2032-05-10",
    "2032-05-31",
    "2032-06-07",
    "2032-07-05",
    "2032-07-20",
    "2032-08-16",
    "2032-10-18",
    "2032-11-01",
    "2032-11-15",
    "2032-12-08",
    "2033-01-10",
    "2033-03-21",
    "2033-04-14",
    "2033-04-15",
    "2033-05-30",
    "2033-06-20",
    "2033-06-27",
    "2033-07-04",
    "2033-07-20",
    "2033-08-15",
    "2033-10-17",
    "2033-11-07",
    "2033-11-14",
    "2033-12-08",
    "2034-01-09",
    "2034-03-20",
    "2034-04-06",
    "2034-04-07",
    "2034-05-01",
    "2034-05-22",
    "2034-06-12",
    "2034-06-19",
    "2034-07-03",
    "2034-07-20",
    "2034-08-07",
    "2034-08-21",
    "2034-10-16",
    "2034-11-06",
    "2034-11-13",
    "2034-12-08",
    "2034-12-25",
    "2035-01-01",
    "2035-01-08",
    "2035-03-19",
    "2035-03-22",
    "2035-03-23",
    "2035-05-01",
    "2035-05-07",
    "2035-05-28",
    "2035-06-04",
    "2035-07-02",
    "2035-07-20",
    "2035-08-07",
    "2035-08-20",
    "2035-10-15",
    "2035-11-05",
    "2035-11-12",
    "2035-12-25"
];

interface WorkingDayCalculatorOptions {
    startDate?: DateTime | undefined;
    daysToAdd?: number | undefined;
    hoursToAdd?: number | undefined;
}

export class DaysDatasourceImpl implements DaysDatasource {

    private readonly holidays: Set<string>;

    constructor() {
        this.holidays = new Set(COLOMBIAN_HOLIDAYS);
    }

    async sumDays(queryParamsDto: QueryParamsDto): Promise<DaysEntity> {
        const { date, days, hours } = queryParamsDto!;
        const result = this.calculate({
            startDate: date,
            daysToAdd: days,
            hoursToAdd: hours
        });
        // Convertir a UTC para la respuesta con la entidad days
        return DaysEntity.fromJson(result);
    }

    // * Verifica si una fecha es día hábil (no fin de semana ni festivo)
    private isWorkingDay(date: DateTime): boolean {
        const weekday = date.weekday;
        const dateString = date.toISODate();

        return WORK_DAYS.includes(weekday) && !this.holidays.has(dateString!);
    }

    // * Verifica si una hora está dentro del horario laboral
    private isWorkingHour(hour: number): boolean {
        return (hour >= WORK_START_HOUR && hour < LUNCH_START_HOUR) ||
            (hour >= LUNCH_END_HOUR && hour < WORK_END_HOUR);
    }

    // * Ajusta una fecha al siguiente momento laboral válido
    private adjustToNextWorkingTime(date: DateTime): DateTime {
        let adjustedDate = date;

        // Si no es día hábil, avanzar al siguiente día hábil y ajustar a 8:00 AM
        if (!this.isWorkingDay(adjustedDate)) {
            while (!this.isWorkingDay(adjustedDate)) {
                adjustedDate = adjustedDate.plus({ days: 1 });
            }
            // Cuando encontramos un día hábil después de un no hábil, ajustar a 8:00 AM
            adjustedDate = adjustedDate.set({ hour: WORK_START_HOUR, minute: 0, second: 0, millisecond: 0 });
            return adjustedDate;
        }

        // Si es día hábil, ajustar hora si está fuera del horario laboral
        const hour = adjustedDate.hour;

        if (hour < WORK_START_HOUR) {
            // Antes de las 8:00 AM
            adjustedDate = adjustedDate.set({ hour: WORK_START_HOUR, minute: 0, second: 0, millisecond: 0 });
        } else if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) {
            // Durante el almuerzo (12:00-13:00)
            adjustedDate = adjustedDate.set({ hour: LUNCH_END_HOUR, minute: 0, second: 0, millisecond: 0 });
        } else if (hour >= WORK_END_HOUR) {
            // Después de las 5:00 PM, ir al siguiente día hábil
            adjustedDate = adjustedDate.plus({ days: 1 }).set({ hour: WORK_START_HOUR, minute: 0, second: 0, millisecond: 0 });

            // Verificar si el siguiente día es hábil
            while (!this.isWorkingDay(adjustedDate)) {
                adjustedDate = adjustedDate.plus({ days: 1 });
            }
        }

        return adjustedDate;
    }

    // * Suma días hábiles a una fecha
    private addWorkingDays(startDate: DateTime, daysToAdd: number): DateTime {
        let currentDate = startDate;
        let remainingDays = daysToAdd;

        while (remainingDays > 0) {
            currentDate = currentDate.plus({ days: 1 });

            if (this.isWorkingDay(currentDate)) {
                remainingDays--;
            }
        }

        // Asegurar que la hora se mantenga exacta después de sumar días
        return currentDate.set({
            hour: startDate.hour,
            minute: startDate.minute,
            second: startDate.second,
            millisecond: startDate.millisecond
        });
    }

    // * Suma horas hábiles a una fecha
    private addWorkingHours(startDate: DateTime, hoursToAdd: number): DateTime {
        let currentDate = startDate;
        let remainingHours = hoursToAdd;

        while (remainingHours > 0) {
            // Si no es día hábil, avanzar al siguiente día hábil
            if (!this.isWorkingDay(currentDate)) {
                currentDate = this.adjustToNextWorkingTime(currentDate);
                continue;
            }

            const currentHour = currentDate.hour;
            const currentMinute = currentDate.minute;

            // Si estamos fuera del horario laboral, ajustar
            if (!this.isWorkingHour(currentHour)) {
                currentDate = this.adjustToNextWorkingTime(currentDate);
                continue;
            }

            // Calcular horas disponibles hasta el final del día laboral
            let availableHours: number;

            if (currentHour < LUNCH_START_HOUR) {
                // Estamos en la mañana
                const hoursUntilLunch = LUNCH_START_HOUR - currentHour - (currentMinute / 60);
                const hoursAfterLunch = WORK_END_HOUR - LUNCH_END_HOUR;
                availableHours = hoursUntilLunch + hoursAfterLunch;
            } else {
                // Estamos en la tarde (después del almuerzo)
                availableHours = WORK_END_HOUR - currentHour - (currentMinute / 60);
            }

            if (remainingHours <= availableHours) {
                // Podemos completar las horas en este día
                let newHour: number;
                let newMinute: number;

                if (currentHour < LUNCH_START_HOUR) {
                    const hoursUntilLunch = LUNCH_START_HOUR - currentHour - (currentMinute / 60);

                    if (remainingHours <= hoursUntilLunch) {
                        // No cruza el almuerzo
                        const totalMinutes = currentMinute + (remainingHours * 60);
                        newHour = currentHour + Math.floor(totalMinutes / 60);
                        newMinute = Math.floor(totalMinutes % 60);
                    } else {
                        // Cruza el almuerzo
                        const hoursAfterLunch = remainingHours - hoursUntilLunch;
                        const totalMinutesAfterLunch = hoursAfterLunch * 60;
                        newHour = LUNCH_END_HOUR + Math.floor(totalMinutesAfterLunch / 60);
                        newMinute = Math.floor(totalMinutesAfterLunch % 60);
                    }
                } else {
                    // Estamos en la tarde, suma directa
                    const totalMinutes = currentMinute + (remainingHours * 60);
                    newHour = currentHour + Math.floor(totalMinutes / 60);
                    newMinute = Math.floor(totalMinutes % 60);
                }

                currentDate = currentDate.set({
                    hour: newHour,
                    minute: newMinute,
                    second: 0,
                    millisecond: 0
                });
                remainingHours = 0;

            } else {
                // Necesitamos continuar en el siguiente día hábil
                remainingHours -= availableHours;
                currentDate = currentDate.plus({ days: 1 }).set({
                    hour: WORK_START_HOUR,
                    minute: 0,
                    second: 0,
                    millisecond: 0
                });

                // Asegurar que el siguiente día sea hábil
                while (!this.isWorkingDay(currentDate)) {
                    currentDate = currentDate.plus({ days: 1 });
                }
            }
        }

        return currentDate;
    }

    // * Calcula la fecha resultante después de sumar días y/o horas hábiles
    public calculate(options: WorkingDayCalculatorOptions): DateTime {
        let startDate = options.startDate || DateTime.now().setZone(COLOMBIA_TIMEZONE);

        // Convertir a zona horaria de Colombia si viene en UTC
        if (startDate.zoneName !== COLOMBIA_TIMEZONE) {
            startDate = startDate.setZone(COLOMBIA_TIMEZONE);
        }

        // Ajustar al siguiente momento laboral válido si es necesario
        let currentDate = this.adjustToNextWorkingTime(startDate);

        // Primero sumar días hábiles
        if (options.daysToAdd && options.daysToAdd > 0) {
            currentDate = this.addWorkingDays(currentDate, options.daysToAdd);
        }

        // Luego sumar horas hábiles
        if (options.hoursToAdd && options.hoursToAdd > 0) {
            currentDate = this.addWorkingHours(currentDate, options.hoursToAdd);
        }

        return currentDate;
    }

}
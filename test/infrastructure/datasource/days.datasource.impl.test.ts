import { DaysDatasourceImpl } from './../../../src/infrastructure/datasource/days.datasource.impl';
import { DateTime } from 'luxon';

describe("Infrastructure Days datasource implementation testing", () => {

    let datasource: DaysDatasourceImpl;

    beforeEach(() => {
        datasource = new DaysDatasourceImpl();
    });

    describe("Testing function isWorkingDay()", () => {

        it("should return true for weekdays that are not holidays", () => {
            // Lunes 13 de enero de 2025 (no es festivo)
            const monday = DateTime.fromISO('2025-01-13T10:00:00', { zone: 'America/Bogota' });
            expect((datasource as any).isWorkingDay(monday)).toBe(true);

            // Martes 14 de enero de 2025 (no es festivo)
            const tuesday = DateTime.fromISO('2025-01-14T10:00:00', { zone: 'America/Bogota' });
            expect((datasource as any).isWorkingDay(tuesday)).toBe(true);

            // Viernes 17 de enero de 2025 (no es festivo)
            const friday = DateTime.fromISO('2025-01-17T10:00:00', { zone: 'America/Bogota' });
            expect((datasource as any).isWorkingDay(friday)).toBe(true);
        });

        it("should return false for weekends", () => {
            // Sábado 18 de enero de 2025
            const saturday = DateTime.fromISO('2025-01-18T10:00:00', { zone: 'America/Bogota' });
            expect((datasource as any).isWorkingDay(saturday)).toBe(false);

            // Domingo 19 de enero de 2025
            const sunday = DateTime.fromISO('2025-01-19T10:00:00', { zone: 'America/Bogota' });
            expect((datasource as any).isWorkingDay(sunday)).toBe(false);
        });

        it("should return false for holidays", () => {
            // 1 de enero de 2025 (Año Nuevo)
            const newYear = DateTime.fromISO('2025-01-01T10:00:00', { zone: 'America/Bogota' });
            expect((datasource as any).isWorkingDay(newYear)).toBe(false);

            // 6 de enero de 2025 (Reyes Magos)
            const epiphany = DateTime.fromISO('2025-01-06T10:00:00', { zone: 'America/Bogota' });
            expect((datasource as any).isWorkingDay(epiphany)).toBe(false);

            // 25 de diciembre de 2025 (Navidad)
            const christmas = DateTime.fromISO('2025-12-25T10:00:00', { zone: 'America/Bogota' });
            expect((datasource as any).isWorkingDay(christmas)).toBe(false);
        });

        it("should return false for holidays that fall on weekdays", () => {
            // 1 de mayo de 2025 (Día del Trabajo) - cae en jueves
            const laborDay = DateTime.fromISO('2025-05-01T10:00:00', { zone: 'America/Bogota' });
            expect((datasource as any).isWorkingDay(laborDay)).toBe(false);
        });

    });

    describe("Testing function isWorkingHour()", () => {

        it("should return true for morning working hours", () => {
            // 8:00 AM - inicio de jornada
            expect((datasource as any).isWorkingHour(8)).toBe(true);

            // 9:00 AM - hora de la mañana
            expect((datasource as any).isWorkingHour(9)).toBe(true);

            // 11:00 AM - antes del almuerzo
            expect((datasource as any).isWorkingHour(11)).toBe(true);
        });

        it("should return true for afternoon working hours", () => {
            // 1:00 PM (13:00) - después del almuerzo
            expect((datasource as any).isWorkingHour(13)).toBe(true);

            // 3:00 PM (15:00) - hora de la tarde
            expect((datasource as any).isWorkingHour(15)).toBe(true);

            // 4:00 PM (16:00) - antes del fin de jornada
            expect((datasource as any).isWorkingHour(16)).toBe(true);
        });

        it("should return false for lunch hour", () => {
            // 12:00 PM (12:00) - hora de almuerzo
            expect((datasource as any).isWorkingHour(12)).toBe(false);
        });

        it("should return false for hours before work starts", () => {
            // 7:00 AM - antes del inicio
            expect((datasource as any).isWorkingHour(7)).toBe(false);

            // 6:00 AM - muy temprano
            expect((datasource as any).isWorkingHour(6)).toBe(false);
        });

        it("should return false for hours after work ends", () => {
            // 5:00 PM (17:00) - fin de jornada
            expect((datasource as any).isWorkingHour(17)).toBe(false);

            // 6:00 PM (18:00) - después del trabajo
            expect((datasource as any).isWorkingHour(18)).toBe(false);
        });

    });

    describe("Testing function adjustToNextWorkingTime()", () => {

        it("should not adjust if already in working time", () => {
            // Martes 14 de enero de 2025 a las 10:30 AM
            const workingTime = DateTime.fromISO('2025-01-14T10:30:00', { zone: 'America/Bogota' });
            const result = (datasource as any).adjustToNextWorkingTime(workingTime);

            expect(result.toISO()).toBe(workingTime.toISO());
        });

        it("should adjust to 8:00 AM if time is before work hours", () => {
            // Martes 14 de enero de 2025 a las 7:00 AM
            const earlyTime = DateTime.fromISO('2025-01-14T07:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).adjustToNextWorkingTime(earlyTime);
            const expected = DateTime.fromISO('2025-01-14T08:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should adjust to 1:00 PM if time is during lunch", () => {
            // Martes 14 de enero de 2025 a las 12:30 PM
            const lunchTime = DateTime.fromISO('2025-01-14T12:30:00', { zone: 'America/Bogota' });
            const result = (datasource as any).adjustToNextWorkingTime(lunchTime);
            const expected = DateTime.fromISO('2025-01-14T13:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should adjust to next working day at 8:00 AM if after work hours", () => {
            // Martes 14 de enero de 2025 a las 6:00 PM
            const afterWork = DateTime.fromISO('2025-01-14T18:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).adjustToNextWorkingTime(afterWork);
            const expected = DateTime.fromISO('2025-01-15T08:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should skip weekends to find next working day", () => {
            // Viernes 17 de enero de 2025 a las 6:00 PM
            const fridayAfterWork = DateTime.fromISO('2025-01-17T18:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).adjustToNextWorkingTime(fridayAfterWork);
            // Debe ir al lunes 20 de enero a las 8:00 AM
            const expected = DateTime.fromISO('2025-01-20T08:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should skip holidays to find next working day", () => {
            // 31 de diciembre de 2024 a las 6:00 PM (día antes de festivo)
            const beforeHoliday = DateTime.fromISO('2024-12-31T18:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).adjustToNextWorkingTime(beforeHoliday);
            // Debe saltar el 1 de enero (festivo) y ir al 2 de enero
            const expected = DateTime.fromISO('2025-01-02T08:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should handle weekend dates", () => {
            // Sábado 18 de enero de 2025 a las 10:00 AM
            const saturday = DateTime.fromISO('2025-01-18T10:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).adjustToNextWorkingTime(saturday);
            // Debe ir al lunes 20 de enero a las 8:00 AM
            const expected = DateTime.fromISO('2025-01-20T08:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

    });

    describe("Testing function addWorkingDays()", () => {

        it("should add working days correctly", () => {
            // Lunes 13 de enero de 2025 + 1 día hábil = Martes 14 de enero
            const monday = DateTime.fromISO('2025-01-13T10:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingDays(monday, 1);
            const expected = DateTime.fromISO('2025-01-14T10:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should skip weekends when adding days", () => {
            // Viernes 17 de enero de 2025 + 1 día hábil = Lunes 20 de enero
            const friday = DateTime.fromISO('2025-01-17T10:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingDays(friday, 1);
            const expected = DateTime.fromISO('2025-01-20T10:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should skip holidays when adding days", () => {
            // 31 de diciembre de 2024 + 1 día hábil = 2 de enero de 2025 (saltando el 1 de enero)
            const beforeNewYear = DateTime.fromISO('2024-12-31T10:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingDays(beforeNewYear, 1);
            const expected = DateTime.fromISO('2025-01-02T10:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should handle multiple working days", () => {
            // Lunes 13 de enero de 2025 + 5 días hábiles = Lunes 20 de enero
            const monday = DateTime.fromISO('2025-01-13T10:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingDays(monday, 5);
            const expected = DateTime.fromISO('2025-01-20T10:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should return same date when adding 0 days", () => {
            const date = DateTime.fromISO('2025-01-13T10:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingDays(date, 0);

            expect(result.toISO()).toBe(date.toISO());
        });

    });

    describe("Testing function addWorkingHours()", () => {

        it("should add hours within the same working day", () => {
            // Martes 14 de enero de 2025 a las 9:00 AM + 2 horas = 11:00 AM
            const morning = DateTime.fromISO('2025-01-14T09:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingHours(morning, 2);
            const expected = DateTime.fromISO('2025-01-14T11:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should handle lunch break correctly", () => {
            // Martes 14 de enero de 2025 a las 11:00 AM + 2 horas = 2:00 PM (saltando almuerzo)
            const beforeLunch = DateTime.fromISO('2025-01-14T11:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingHours(beforeLunch, 2);
            const expected = DateTime.fromISO('2025-01-14T14:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should move to next working day when exceeding work hours", () => {
            // Martes 14 de enero de 2025 a las 4:00 PM + 2 horas = Miércoles 15 a las 9:00 AM
            const afternoon = DateTime.fromISO('2025-01-14T16:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingHours(afternoon, 2);
            const expected = DateTime.fromISO('2025-01-15T09:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should skip weekends when moving to next day", () => {
            // Viernes 17 de enero de 2025 a las 4:00 PM + 2 horas = Lunes 20 a las 9:00 AM
            const fridayAfternoon = DateTime.fromISO('2025-01-17T16:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingHours(fridayAfternoon, 2);
            const expected = DateTime.fromISO('2025-01-20T09:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should handle multiple days of hours", () => {
            // Martes 14 de enero de 2025 a las 9:00 AM + 16 horas (2 días laborales)
            const morning = DateTime.fromISO('2025-01-14T09:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingHours(morning, 16);
            const expected = DateTime.fromISO('2025-01-16T09:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should adjust start time if not in working hours", () => {
            // Sábado 18 de enero de 2025 a las 10:00 AM + 1 hora = Lunes 20 a las 9:00 AM
            const weekend = DateTime.fromISO('2025-01-18T10:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingHours(weekend, 1);
            const expected = DateTime.fromISO('2025-01-20T09:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should add 2 hours from 8:00 AM correctly", () => {
            // Test específico para verificar 8:00 AM + 2 horas = 10:00 AM
            const morning = DateTime.fromISO('2025-01-13T08:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingHours(morning, 2);
            const expected = DateTime.fromISO('2025-01-13T10:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should handle adding hours when starting from non-working hours on working day", () => {
            // Test para cubrir el caso: "Si estamos fuera del horario laboral, ajustar"
            // Martes 14 de enero de 2025 a las 7:00 AM (antes del horario) + 2 horas
            const beforeWork = DateTime.fromISO('2025-01-14T07:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingHours(beforeWork, 2);
            // Debe ajustar a 8:00 AM y sumar 2 horas = 10:00 AM
            const expected = DateTime.fromISO('2025-01-14T10:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should add hours when starting in afternoon", () => {
            // Test para cubrir el caso: "Estamos en la tarde, suma directa"
            // Martes 14 de enero de 2025 a las 2:00 PM + 1 hora = 3:00 PM
            const afternoon = DateTime.fromISO('2025-01-14T14:00:00', { zone: 'America/Bogota' });
            const result = (datasource as any).addWorkingHours(afternoon, 1);
            const expected = DateTime.fromISO('2025-01-14T15:00:00', { zone: 'America/Bogota' });

            expect(result.toISO()).toBe(expected.toISO());
        });


    });

    describe("Testing function calculate()", () => {

        it("should calculate with only days parameter", () => {
            const startDate = DateTime.fromISO('2025-01-13T10:00:00', { zone: 'America/Bogota' });
            const result = datasource.calculate({
                startDate: startDate,
                daysToAdd: 2
            });

            // Lunes + 2 días hábiles = Miércoles
            const expected = DateTime.fromISO('2025-01-15T10:00:00', { zone: 'America/Bogota' });
            expect(result.toISO()).toBe(expected.toISO());
        });


        it("should calculate with only hours parameter", () => {
            const startDate = DateTime.fromISO('2025-01-13T10:00:00', { zone: 'America/Bogota' });
            const result = datasource.calculate({
                startDate: startDate,
                hoursToAdd: 3
            });

            // 10:00 AM + 3 horas de trabajo:
            // 10:00-12:00 (2h) + salto almuerzo + 13:00-14:00 (1h) = 3h total → 14:00
            const expected = DateTime.fromISO('2025-01-13T14:00:00', { zone: 'America/Bogota' });
            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should calculate with both days and hours (days first, then hours)", () => {
            const startDate = DateTime.fromISO('2025-01-13T15:00:00', { zone: 'America/Bogota' });
            const result = datasource.calculate({
                startDate: startDate,
                daysToAdd: 1,
                hoursToAdd: 4
            });

            // Lunes 3:00 PM + 1 día = Martes 3:00 PM, + 4 horas = Miércoles 10:00 AM
            const expected = DateTime.fromISO('2025-01-15T10:00:00', { zone: 'America/Bogota' });
            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should use current time when no startDate provided", () => {
            const mockNow = DateTime.fromISO('2025-01-13T10:00:00', { zone: 'America/Bogota' }) as DateTime<true>;
            jest.spyOn(DateTime, 'now').mockReturnValue(mockNow);

            const result = datasource.calculate({
                daysToAdd: 1
            });

            const expected = DateTime.fromISO('2025-01-14T10:00:00', { zone: 'America/Bogota' });
            expect(result.toISO()).toBe(expected.toISO());

            jest.restoreAllMocks();
        });

        it("should handle timezone conversion from UTC to Colombia", () => {
            // Fecha en UTC que debe convertirse a Colombia
            const utcDate = DateTime.fromISO('2025-01-13T15:00:00Z'); // 3:00 PM UTC = 10:00 AM Colombia
            const result = datasource.calculate({
                startDate: utcDate,
                hoursToAdd: 2
            });

            const expected = DateTime.fromISO('2025-01-13T12:00:00', { zone: 'America/Bogota' });
            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should adjust invalid start times to working hours", () => {
            // Sábado (no laboral)
            const weekend = DateTime.fromISO('2025-01-18T10:00:00', { zone: 'America/Bogota' });
            const result = datasource.calculate({
                startDate: weekend,
                hoursToAdd: 1
            });

            // Debe ajustar al lunes a las 8:00 AM y sumar 1 hora
            const expected = DateTime.fromISO('2025-01-20T09:00:00', { zone: 'America/Bogota' });
            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should debug complex scenario step by step", () => {
            // Debug del escenario complejo paso a paso
            const yearEnd = DateTime.fromISO('2024-12-31T16:00:00', { zone: 'America/Bogota' });

            // Paso 1: Ajustar al siguiente momento laboral (no debería cambiar porque 4:00 PM está en horario)
            const step1 = (datasource as any).adjustToNextWorkingTime(yearEnd);
            // console.log('Step 1 (adjust):', step1.toISO());

            // Paso 2: Sumar 1 día hábil (saltando 1 ene festivo)
            const step2 = (datasource as any).addWorkingDays(step1, 1);
            // console.log('Step 2 (+ 1 day):', step2.toISO());

            // Paso 3: Sumar 2 horas (4:00 PM + 2h = 6:00 PM, excede jornada → siguiente día 9:00 AM)
            const step3 = (datasource as any).addWorkingHours(step2, 2);
            // console.log('Step 3 (+ 2 hours):', step3.toISO());

            // Resultado esperado corregido
            const expected = DateTime.fromISO('2025-01-03T09:00:00', { zone: 'America/Bogota' });
            expect(step3.toISO()).toBe(expected.toISO());
        });


        it("should handle complex scenario with holidays and weekends", () => {
            // 31 de diciembre de 2024 a las 4:00 PM + 1 día + 2 horas
            const yearEnd = DateTime.fromISO('2024-12-31T16:00:00', { zone: 'America/Bogota' });
            const result = datasource.calculate({
                startDate: yearEnd,
                daysToAdd: 1,
                hoursToAdd: 2
            });

            // Lógica correcta:
            // 31 dic 4:00 PM (dentro del horario) → no se ajusta
            // + 1 día hábil → 2 ene 4:00 PM (saltando 1 ene festivo)
            // + 2 horas → 2 ene 6:00 PM, pero excede jornada → 3 ene 9:00 AM
            const expected = DateTime.fromISO('2025-01-03T09:00:00', { zone: 'America/Bogota' });
            expect(result.toISO()).toBe(expected.toISO());
        });

        it("should handle zero values correctly", () => {
            const startDate = DateTime.fromISO('2025-01-13T10:00:00', { zone: 'America/Bogota' });
            const result = datasource.calculate({
                startDate: startDate,
                daysToAdd: 0,
                hoursToAdd: 0
            });

            expect(result.toISO()).toBe(startDate.toISO());
        });

    });

});
import request from 'supertest'
import { DateTime } from 'luxon';
import { testServer } from '../../test-server';
import { DaysDatasourceImpl } from '../../../src/infrastructure/datasource/days.datasource.impl';


describe("Days routes testing", () => {

    let datasource: DaysDatasourceImpl;
    beforeAll(async () => {
        await testServer.start();
        datasource = new DaysDatasourceImpl();
    });

    afterAll(() => {
        testServer.close();
    });

    describe("Error cases", () => {

        it("should return status 400 when no parameters provided", async () => {
            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .expect(400);

            expect(body).toMatchObject({
                error: 'InvalidParameters',
                message: expect.stringContaining("Debe enviar al menos un campo")
            });
            expect(body).not.toHaveProperty('date');
        });

        it("should return status 400 with invalid days parameter", async () => {
            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({ days: -1 })
                .expect(400);

            expect(body).toMatchObject({
                error: 'InvalidParameters',
                message: expect.any(String)
            });
        });

        it("should return status 400 with invalid hours parameter", async () => {
            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({ hours: 'invalid' })
                .expect(400);

            expect(body).toMatchObject({
                error: 'InvalidParameters',
                message: expect.any(String)
            });
        });

        it("should return status 400 with invalid date parameter", async () => {
            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({ date: 'invalid-date', hours: 1 })
                .expect(400);

            expect(body).toMatchObject({
                error: 'InvalidParameters',
                message: expect.any(String)
            });
        });

    });

    describe("Success cases", () => {

        it("should handle Friday 5:00 PM + 1 hour → Monday 9:00 AM", async () => {
            // Viernes 17 de enero de 2025 a las 5:00 PM Colombia = 10:00 PM UTC
            const fridayDate = DateTime.fromISO('2025-01-17T22:00:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: fridayDate.toISO(),
                    hours: 1
                })
                .expect(200);

            expect(body).toMatchObject({
                date: expect.any(String)
            });
            expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // Viernes 5:00 PM (no se ajusta, es hora válida) + 1 hora = Lunes 9:00 AM
            // (Las horas se mueven al siguiente día hábil cuando exceden la jornada)
            expect(body.date).toBe('2025-01-20T14:00:00.000Z');
        });

        it("should handle Saturday 2:00 PM + 1 hour → Monday 9:00 AM", async () => {
            // Sábado 18 de enero de 2025 a las 2:00 PM Colombia = 7:00 PM UTC
            const saturdayDate = DateTime.fromISO('2025-01-18T19:00:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: saturdayDate.toISO(),
                    hours: 1
                })
                .expect(200);

            expect(body).toMatchObject({
                date: expect.any(String)
            });
            expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // Sábado → ajustar ATRÁS a Viernes 5:00 PM + 1 hora = Lunes 9:00 AM
            expect(body.date).toBe('2025-01-20T14:00:00.000Z');
        });

        it("should handle Tuesday 3:00 PM + 1 day + 4 hours → Thursday 10:00 AM", async () => {
            // Martes 14 de enero de 2025 a las 3:00 PM Colombia = 8:00 PM UTC
            const tuesdayDate = DateTime.fromISO('2025-01-14T20:00:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: tuesdayDate.toISO(),
                    days: 1,
                    hours: 4
                })
                .expect(200);

            expect(body).toMatchObject({
                date: expect.any(String)
            });
            expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // Martes 3:00 PM (hora válida) + 1 día = Miércoles 3:00 PM + 4 horas = Jueves 10:00 AM
            expect(body.date).toBe('2025-01-16T15:00:00.000Z');
        });

        it("should handle Sunday 6:00 PM + 1 day → Monday 5:00 PM", async () => {
            // Domingo 19 de enero de 2025 a las 6:00 PM Colombia = 11:00 PM UTC
            const sundayDate = DateTime.fromISO('2025-01-19T23:00:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: sundayDate.toISO(),
                    days: 1
                })
                .expect(200);

            expect(body).toMatchObject({
                date: expect.any(String)
            });
            expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // Domingo → ajustar ATRÁS a Viernes 5:00 PM + 1 día = Lunes 5:00 PM
            expect(body.date).toBe('2025-01-20T22:00:00.000Z');
        });

        it("should handle working day 8:00 AM + 8 hours → same day 5:00 PM", async () => {
            // Lunes 13 de enero de 2025 a las 8:00 AM Colombia = 1:00 PM UTC
            const mondayDate = DateTime.fromISO('2025-01-13T13:00:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: mondayDate.toISO(),
                    hours: 8
                })
                .expect(200);

            expect(body).toMatchObject({
                date: expect.any(String)
            });
            expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // Lunes 8:00 AM + 8 horas laborales = Lunes 5:00 PM
            expect(body.date).toBe('2025-01-13T22:00:00.000Z');
        });

        it("should handle working day 8:00 AM + 1 day → next working day 8:00 AM", async () => {
            // Lunes 13 de enero de 2025 a las 8:00 AM Colombia = 1:00 PM UTC
            const mondayDate = DateTime.fromISO('2025-01-13T13:00:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: mondayDate.toISO(),
                    days: 1
                })
                .expect(200);

            expect(body).toMatchObject({
                date: expect.any(String)
            });
            expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // Lunes 8:00 AM + 1 día hábil = Martes 8:00 AM
            expect(body.date).toBe('2025-01-14T13:00:00.000Z');
        });

        it("should handle working day 12:30 PM + 1 day → next working day 12:00 PM", async () => {
            // Lunes 13 de enero de 2025 a las 12:30 PM Colombia = 5:30 PM UTC
            const mondayDate = DateTime.fromISO('2025-01-13T17:30:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: mondayDate.toISO(),
                    days: 1
                })
                .expect(200);

            expect(body).toMatchObject({
                date: expect.any(String)
            });
            expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // Lunes 12:30 PM → ajusta ATRÁS a 12:00 PM + 1 día = Martes 12:00 PM
            expect(body.date).toBe('2025-01-14T17:00:00.000Z');
        });

        it("should handle working day 11:30 AM + 3 hours → same day 3:30 PM", async () => {
            // Lunes 13 de enero de 2025 a las 11:30 AM Colombia = 4:30 PM UTC
            const mondayDate = DateTime.fromISO('2025-01-13T16:30:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: mondayDate.toISO(),
                    hours: 3
                })
                .expect(200);

            expect(body).toMatchObject({
                date: expect.any(String)
            });
            expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // Lunes 11:30 AM + 3 horas = Lunes 3:30 PM (cruza almuerzo)
            expect(body.date).toBe('2025-01-13T20:30:00.000Z');
        });

        it("should handle April 10 + 5 days + 4 hours (with holidays April 17-18)", async () => {
            // 10 de abril de 2025 a las 10:00 AM Colombia = 3:00 PM UTC
            const aprilDate = DateTime.fromISO('2025-04-10T15:00:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: aprilDate.toISO(),
                    days: 5,
                    hours: 4
                })
                .expect(200);

            expect(body).toMatchObject({
                date: expect.any(String)
            });
            expect(body.date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

            // 10 abril 10:00 AM + 5 días hábiles + 4 horas = 21 abril 3:00 PM
            // (Saltando festivos 17 y 18 de abril)
            expect(body.date).toBe('2025-04-21T20:00:00.000Z');
        });

    });

    describe("Edge cases", () => {

        it("should handle zero values correctly", async () => {
            const startDate = DateTime.fromISO('2025-01-13T15:00:00.000Z');

            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({
                    date: startDate.toISO(),
                    days: 0,
                    hours: 1
                })
                .expect(200);

            const resultDate = DateTime.fromISO(body.date);
            expect(resultDate.isValid).toBe(true);
        });

        it("should handle large values", async () => {
            const { body } = await request(testServer.app)
                .get("/api/days/sum-days")
                .query({ days: 10 })
                .expect(200);

            const resultDate = DateTime.fromISO(body.date);
            expect(resultDate.isValid).toBe(true);

            // Verificar que está significativamente en el futuro
            const daysDiff = resultDate.diff(DateTime.now(), 'days').days;
            expect(daysDiff).toBeGreaterThan(5); // Al menos 5 días en el futuro
        });

    });

});
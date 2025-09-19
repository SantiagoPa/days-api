import { QueryParamsDto } from "../../../../src/domain";


describe("Dtos QueryParamsDto testing", () => {

    it("should return array string error - does not provide the query params", () => {
        const [error] = QueryParamsDto.create({});
        expect(error).toBe("Debe enviar al menos un campo de los siguientes, 'date', 'days', 'hours'")
    });

    it("should return array string error - does not provide the correct query param [day]", () => {
        const [error] = QueryParamsDto.create({ days: -10 });
        expect(error).toBe("El campo 'days' debe ser un entero positivo");
    });

    it("should return array string error - does not provide the correct query param [hours]", () => {
        const [error] = QueryParamsDto.create({ hours: -5 });
        expect(error).toBe("El campo 'hours' debe ser un entero positivo");
    });

    it("should return array string error - does not provide the correct query param [date]", () => {
        const [error] = QueryParamsDto.create({ date: "test-date" });
        expect(error).toBe("El campo 'date' debe ser una fecha válida en formato ISO 8601 con sufijo 'Z'");
    });

});
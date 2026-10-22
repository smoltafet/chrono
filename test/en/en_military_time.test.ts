import * as chrono from "../../src";
import { testSingleCase, testUnexpectedResult } from "../test_util";
import { Meridiem } from "../../src";

test("Test - Military time with 'hours' suffix", function () {
    testSingleCase(chrono, "The briefing is at 1430 hours", new Date(2026, 9, 21, 8), (result, text) => {
        expect(result.index).toBe(16);
        expect(result.text).toBe("at 1430 hours");
        expect(result.start.get("hour")).toBe(14);
        expect(result.start.get("minute")).toBe(30);
        expect(result.start.get("meridiem")).toBe(Meridiem.PM);
        expect(result.tags()).toContain("parser/ENMilitaryTimeParser");
    });

    testSingleCase(chrono, "Depart at 0930hrs", new Date(2026, 9, 21, 8), (result, text) => {
        expect(result.index).toBe(7);
        expect(result.text).toBe("at 0930hrs");
        expect(result.start.get("hour")).toBe(9);
        expect(result.start.get("minute")).toBe(30);
        expect(result.start.get("meridiem")).toBe(Meridiem.AM);
    });

    testSingleCase(chrono, "Report by 0800 hr", new Date(2026, 9, 21, 8), (result, text) => {
        expect(result.text).toBe("0800 hr");
        expect(result.start.get("hour")).toBe(8);
        expect(result.start.get("minute")).toBe(0);
    });

    testSingleCase(chrono, "2359 hours", new Date(2026, 9, 21, 8), (result, text) => {
        expect(result.text).toBe(text);
        expect(result.start.get("hour")).toBe(23);
        expect(result.start.get("minute")).toBe(59);
    });

    testSingleCase(chrono, "0000 hours", new Date(2026, 9, 21, 8), (result, text) => {
        expect(result.text).toBe(text);
        expect(result.start.get("hour")).toBe(0);
        expect(result.start.get("minute")).toBe(0);
        expect(result.start.get("meridiem")).toBe(Meridiem.AM);
    });
});

test("Test - Military time with 'at' prefix", function () {
    testSingleCase(chrono, "Meet at 1430", new Date(2026, 9, 21, 8), (result, text) => {
        expect(result.index).toBe(5);
        expect(result.text).toBe("at 1430");
        expect(result.start.get("hour")).toBe(14);
        expect(result.start.get("minute")).toBe(30);
    });

    testSingleCase(chrono, "The train leaves at 0745 tomorrow", new Date(2026, 9, 21, 8), (result, text) => {
        expect(result.text).toBe("at 0745 tomorrow");
        expect(result.start.get("day")).toBe(22);
        expect(result.start.get("hour")).toBe(7);
        expect(result.start.get("minute")).toBe(45);
    });
});

test("Test - Military time with Zulu designator", function () {
    testSingleCase(chrono, "Pickup at 1430Z", new Date(2026, 9, 21, 8), (result, text) => {
        expect(result.text).toBe("at 1430Z");
        expect(result.start.get("hour")).toBe(14);
        expect(result.start.get("minute")).toBe(30);
        expect(result.start.get("timezoneOffset")).toBe(0);
    });
});

test("Test - Military time merges with a date", function () {
    testSingleCase(chrono, "On Oct 22 at 1430 hours", new Date(2026, 9, 21, 8), (result, text) => {
        expect(result.start.get("year")).toBe(2026);
        expect(result.start.get("month")).toBe(10);
        expect(result.start.get("day")).toBe(22);
        expect(result.start.get("hour")).toBe(14);
        expect(result.start.get("minute")).toBe(30);
    });
});

test("Test - Bare four-digit numbers are not military time", function () {
    testUnexpectedResult(chrono, "2019 to 2020");

    testUnexpectedResult(chrono, "The year 2020 was long");

    testUnexpectedResult(chrono, "1430");
});

test("Test - Invalid military times are rejected", function () {
    testUnexpectedResult(chrono, "Meet at 2460");

    testUnexpectedResult(chrono, "Meet at 1299 hours");

    testUnexpectedResult(chrono, "Meet at 2500 hours");
});

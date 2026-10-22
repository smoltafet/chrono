import { ParsingContext } from "../../../chrono";
import { AbstractParserWithWordBoundaryChecking } from "../../../common/parsers/AbstractParserWithWordBoundary";
import { Meridiem } from "../../../types";

// Military time: a four-digit HHMM group, e.g. "1430" for 14:30.
//
// Bare four-digit numbers are deliberately NOT parsed as times by
// chrono (they are far more often years - "2019 to 2020"), so this
// parser only accepts the shapes that mark the number as a time:
//   - with an "hours" suffix: "1430 hours", "0930hrs", "0800 hr"
//   - introduced by "at":     "at 1430", "meet at 0930"
//   - with a "Z" (Zulu/UTC) designator: "1430Z", "1430 Z"
//
// The HHMM value itself is validated: hour must be 00-23 and minute
// 00-59, so year-like values such as "at 2019" only parse when they
// also form a valid time of day (20:19) - which, preceded by "at",
// is the reading the writer intended.
const PATTERN = /(at\s+)?(\d{4})(?:\s*(hours?|hrs?)\b|\s*(z)\b)?(?!\d)(?![.:]\d)/i;

export default class ENMilitaryTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN;
    }

    innerExtract(context: ParsingContext, match: RegExpMatchArray) {
        const atPrefix = match[1];
        const digits = match[2];
        const hoursSuffix = match[3];
        const zuluSuffix = match[4];

        // A bare HHMM with no time marker at all is not military
        // time - leave it to the year handling.
        if (!atPrefix && !hoursSuffix && !zuluSuffix) {
            return null;
        }

        const hour = parseInt(digits.substring(0, 2), 10);
        const minute = parseInt(digits.substring(2, 4), 10);
        if (hour > 23 || minute > 59) {
            return null;
        }

        const components = context.createParsingComponents();
        components.assign("hour", hour);
        components.assign("minute", minute);
        components.assign("meridiem", hour < 12 ? Meridiem.AM : Meridiem.PM);
        if (zuluSuffix) {
            components.assign("timezoneOffset", 0);
        }
        return components.addTag("parser/ENMilitaryTimeParser");
    }
}

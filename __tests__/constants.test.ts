import {contentType, Insert, ServerError, ServerErrorType} from "../src/constants";
import {ContentType, DBType} from "../src/info";

describe('test constants', () => {
    test('contentType returns JSON for JSON DBType', () => {
        expect(contentType(DBType.JSON)).toEqual(ContentType.JSON);
    });

    test('contentType returns XML for XML DBType', () => {
        expect(contentType(DBType.XML)).toEqual(ContentType.XML);
    });

    test('Insert enum values', () => {
        expect(Insert.CHILD).toEqual("asFirstChild");
        expect(Insert.LEFT).toEqual("asLeftSibling");
        expect(Insert.RIGHT).toEqual("asRightSibling");
        expect(Insert.REPLACE).toEqual("replace");
    });
});

describe('test ServerError', () => {
    test('404 maps to NotFound', () => {
        const err = new ServerError(404, "not found");
        expect(err.status).toBe(404);
        expect(err.message).toEqual("not found");
        expect(err.errorType).toEqual(ServerErrorType.NotFound);
    });

    test('401 maps to Unauthorized', () => {
        const err = new ServerError(401, "unauthorized");
        expect(err.status).toBe(401);
        expect(err.message).toEqual("unauthorized");
        expect(err.errorType).toEqual(ServerErrorType.Unauthorized);
    });

    test('500 maps to InternalServerError', () => {
        const err = new ServerError(500, "internal server error");
        expect(err.status).toBe(500);
        expect(err.message).toEqual("internal server error");
        expect(err.errorType).toEqual(ServerErrorType.InternalServerError);
    });

    test('unknown status maps to Other', () => {
        const err = new ServerError(403, "forbidden");
        expect(err.status).toBe(403);
        expect(err.message).toEqual("forbidden");
        expect(err.errorType).toEqual(ServerErrorType.Other);
    });

    test('502 maps to Other', () => {
        const err = new ServerError(502, "bad gateway");
        expect(err.errorType).toEqual(ServerErrorType.Other);
    });
});

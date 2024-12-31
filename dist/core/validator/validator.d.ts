import { PropRules } from "./builder";
export type ValidationResults = {
    passed: boolean;
    errors: string[];
};
export type ValidationFunction = (value: any) => boolean;
export declare class Validator {
    private allSchemas;
    private customValidationFunctions;
    private VALIDATE_FUNCTIONS;
    constructor();
    addSchema(route: string, methodName: string, rules: PropRules[]): void;
    addValidationFunction(name: string, func: ValidationFunction): void;
    private validateWithCustomFunction;
    testValidation(schemaName: string, methodName: string, json: any): ValidationResults;
    parseQueryString(p: PropRules, value: any): any;
    private parseValue;
    private parseQueryString_Object;
    private parseQueryString_Array;
    validate(p: PropRules, value: any): string[];
    print(): void;
    private validateObject;
    private validateIsArray;
}

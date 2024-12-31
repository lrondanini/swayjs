import { ParameterDeclaration, TypeChecker } from "ts-morph";
export declare enum ValidationRule {
    IsType = "IsType",
    IsArray = "IsArray",
    IsObject = "IsObject",
    MaxLength = "MaxLength",
    MinLength = "MinLength",
    Contains = "Contains",
    Format = "Format",
    Max = "Max",
    Min = "Min",
    Custom = "Custom"
}
export declare enum BaseTypes {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Enum = "enum",
    Any = "any",
    Unknown = "unknown",
    Object = "object"
}
export type ValidationRuleSetting = {
    key: string;
    rule: ValidationRule;
    type?: BaseTypes;
    fullType?: string;
    value?: number | string | boolean | string[] | number[] | boolean[];
    rules?: PropRules[];
};
export type ValidationRules = {
    and: ValidationRuleSetting[];
    or: ValidationRuleSetting[][];
};
export type PropRules = {
    propName: string;
    optional: boolean;
    rules: ValidationRules;
};
export default class ValidatorFactory {
    private currentParsedFile;
    private currentParsedClass;
    constructor();
    parseParameter(param: ParameterDeclaration, typeChecker: TypeChecker): PropRules;
    private getEnumValues;
    private parseProperty;
    private parseType;
    private parseObject;
    private parseArray;
    private getRuleName;
    private parseValidationRule;
    private isOptional;
}

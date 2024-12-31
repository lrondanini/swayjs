import { ValidationRuleSetting } from "./builder";
type RuleBase<Props extends RuleBase.IProps<any, any>> = {
    "rule"?: Props;
};
declare namespace RuleBase {
    interface IProps<Target extends "boolean" | "bigint" | "number" | "string" | "array" | "object", Value extends boolean | bigint | number | string | undefined> {
        target: Target;
        value: Value;
    }
}
export declare namespace ValidationRule {
    type MaxLength<Value extends number> = RuleBase<{
        target: "string | array";
        value: Value;
    }>;
    type MinLength<Value extends number> = RuleBase<{
        target: "string | array";
        value: Value;
    }>;
    type Contains<Value extends string | number | boolean> = RuleBase<{
        target: "string | array";
        value: Value;
    }>;
    type Format<Value extends string> = RuleBase<{
        target: "string | array";
        value: Value;
    }>;
    type Max<Value extends number> = RuleBase<{
        target: "number";
        value: Value;
    }>;
    type Min<Value extends number> = RuleBase<{
        target: "number";
        value: Value;
    }>;
    type Custom<Value extends string | number | boolean> = RuleBase<{
        target: "any";
        value: Value;
    }>;
}
export declare function validateIsType(value: any, rule: ValidationRuleSetting): boolean;
export declare function validateMin(value: any, rule: ValidationRuleSetting): boolean;
export declare function validateMax(value: any, rule: ValidationRuleSetting): boolean;
export declare function validateMaxLength(value: any, rule: ValidationRuleSetting): boolean;
export declare function validateMinLength(value: any, rule: ValidationRuleSetting): boolean;
export declare function validateContains(value: any, rule: ValidationRuleSetting): boolean;
export declare function validateFormat(value: any, rule: ValidationRuleSetting): boolean;
export {};

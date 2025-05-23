import { validateContains, validateFormat, validateIsType, validateMaxLength, validateMinLength } from "./types-validators";
import { BaseTypes, ValidationRule } from "./builder";
export class Validator {
    constructor() {
        this.allSchemas = {};
        this.customValidationFunctions = {};
        this.VALIDATE_FUNCTIONS = {};
        this.VALIDATE_FUNCTIONS[ValidationRule.IsType] = validateIsType;
        this.VALIDATE_FUNCTIONS[ValidationRule.MaxLength] = validateMaxLength;
        this.VALIDATE_FUNCTIONS[ValidationRule.MinLength] = validateMinLength;
        this.VALIDATE_FUNCTIONS[ValidationRule.Contains] = validateContains;
        this.VALIDATE_FUNCTIONS[ValidationRule.Format] = validateFormat;
        this.VALIDATE_FUNCTIONS[ValidationRule.Custom] = this.validateWithCustomFunction.bind(this);
    }
    addSchema(route, methodName, rules) {
        this.allSchemas[route + "-" + methodName] = rules;
    }
    addValidationFunction(name, func) {
        this.customValidationFunctions[name] = func;
    }
    validateWithCustomFunction(value, rule) {
        const func = this.customValidationFunctions[rule.value];
        if (func) {
            return func(value);
        }
        return false;
    }
    testValidation(schemaName, methodName, json) {
        const props = this.allSchemas[schemaName + "-" + methodName];
        let errors = [];
        for (let k = 0; k < props.length; k++) {
            const p = props[k];
            errors = [...errors, ...this.validate(p, json)];
        }
        return {
            passed: errors.length === 0 ? true : false,
            errors: errors
        };
    }
    parseQueryString(p, value) {
        let parsedValue = value;
        for (let i = 0; i < p.rules.and.length; i++) {
            const r = p.rules.and[i];
            if (r.rule === ValidationRule.IsObject) {
                if (typeof value === 'string') {
                    value = JSON.parse(value);
                }
                parsedValue = this.parseQueryString_Object(value, r);
            }
            else if (r.rule === ValidationRule.IsArray) {
                if (typeof value === 'string' && r.type != BaseTypes.String) {
                    value = JSON.parse(value);
                }
                parsedValue = this.parseQueryString_Array(value, r);
            }
            else if (r.rule === ValidationRule.IsType) {
                if (r.type === BaseTypes.Number) {
                    if (typeof value === 'string') {
                        parsedValue = JSON.parse(value);
                    }
                }
                else if (r.type === BaseTypes.Boolean) {
                    if (typeof value === 'string') {
                        parsedValue = parsedValue.toLowerCase() === 'true' ? true : false;
                    }
                }
            }
        }
        for (let j = 0; j < p.rules.or.length; j++) {
            const orR = p.rules.or[j];
            for (const r of orR) {
                if (r.rule === ValidationRule.IsObject) {
                    if (typeof value === 'string') {
                        value = JSON.parse(value);
                    }
                    parsedValue = this.parseQueryString_Object(value, r);
                }
                else if (r.rule === ValidationRule.IsArray) {
                    if (typeof value === 'string' && r.type != BaseTypes.String) {
                        value = JSON.parse(value);
                    }
                    parsedValue = this.parseQueryString_Array(value, r);
                }
                else if (r.rule === ValidationRule.IsType) {
                    if (r.type === BaseTypes.Number) {
                        if (typeof value === 'string') {
                            parsedValue = JSON.parse(value);
                        }
                    }
                    else if (r.type === BaseTypes.Boolean) {
                        if (typeof value === 'string') {
                            parsedValue = parsedValue.toLowerCase() === 'true' ? true : false;
                        }
                    }
                }
            }
        }
        return parsedValue;
    }
    parseValue(value, r) {
        let parsedValue = value;
        if (r.rule === ValidationRule.IsObject) {
            if (typeof value === 'string') {
                value = JSON.parse(value);
            }
            parsedValue = this.parseQueryString_Object(value, r);
        }
        else if (r.rule === ValidationRule.IsArray) {
            if (typeof value === 'string' && r.type != BaseTypes.String) {
                value = JSON.parse(value);
            }
            parsedValue = this.parseQueryString_Array(value, r);
        }
        else if (r.rule === ValidationRule.IsType) {
            if (r.type === BaseTypes.Number) {
                if (typeof value === 'string') {
                    parsedValue = JSON.parse(value);
                }
            }
            else if (r.type === BaseTypes.Boolean) {
                if (typeof value === 'string') {
                    parsedValue = parsedValue.toLowerCase() === 'true' ? true : false;
                }
            }
        }
        return parsedValue;
    }
    parseQueryString_Object(json, rule) {
        let parsedValue = json;
        const rules = rule.rules;
        for (let k = 0; k < rules.length; k++) {
            const p = rules[k];
            let value = json[p.propName];
            if (value === undefined) {
                value = json[p.propName + "[]"];
            }
            parsedValue[p.propName] = this.parseQueryString(p, value);
        }
        return parsedValue;
    }
    parseQueryString_Array(value, rule) {
        let parsedValue = value;
        const exptectedType = rule.type;
        if (Array.isArray(value)) {
            if (exptectedType === BaseTypes.Object) {
                let tmp = [];
                for (var i = 0; i < value.length; i++) {
                    tmp.push(this.parseQueryString_Object(value[i], rule));
                }
                parsedValue = tmp;
            }
            else {
                let tmp = [];
                for (var i = 0; i < value.length; i++) {
                    tmp.push(this.parseValue(value[i], rule));
                }
                parsedValue = tmp;
            }
        }
        return parsedValue;
    }
    validate(p, value) {
        let errors = [];
        if (p.optional && value === undefined) {
            return errors;
        }
        if (!p.optional && value === undefined) {
            errors.push(`${p.propName}: is required`);
            return errors;
        }
        const validationCache = {};
        for (let i = 0; i < p.rules.and.length; i++) {
            const r = p.rules.and[i];
            const key = r.key;
            if (validationCache[key]) {
                continue;
            }
            else {
                let passed = false;
                if (r.rule === ValidationRule.IsObject) {
                    passed = this.validateObject(value, r, errors);
                }
                else if (r.rule === ValidationRule.IsArray) {
                    passed = this.validateIsArray(value, r, errors);
                }
                else {
                    passed = this.VALIDATE_FUNCTIONS[r.rule](value, r);
                    if (!passed) {
                        errors.push(`${p.propName}: expected ${r.rule} ${r.type ? JSON.stringify(r.type) : ''} ${r.fullType ? JSON.stringify(r.fullType) : ''} ${r.value ? JSON.stringify(r.value) + ' ' : ' '}to pass found: ${JSON.stringify(value)}`);
                    }
                }
                validationCache[key] = passed;
            }
        }
        let orErrors = [];
        for (let j = 0; j < p.rules.or.length; j++) {
            const orR = p.rules.or[j];
            let tmpErrors = [];
            for (const r of orR) {
                const key = r.key;
                if (validationCache[key]) {
                    continue;
                }
                else {
                    let passed = false;
                    if (r.rule === ValidationRule.IsObject) {
                        passed = this.validateObject(value, r, errors);
                    }
                    else if (r.rule === ValidationRule.IsArray) {
                        passed = this.validateIsArray(value, r, errors);
                    }
                    else {
                        passed = this.VALIDATE_FUNCTIONS[r.rule](value, r);
                        if (!passed) {
                            tmpErrors.push(`${p.propName}: expected ${r.rule} ${r.type ? JSON.stringify(r.type) : ''} ${r.fullType ? JSON.stringify(r.fullType) : ''} ${r.value ? JSON.stringify(r.value) + ' ' : ' '}to pass found: ${JSON.stringify(value)}`);
                        }
                    }
                    validationCache[key] = passed;
                }
            }
            if (tmpErrors.length === 0) {
                orErrors = [];
                break;
            }
            else {
                orErrors.push(...tmpErrors);
            }
        }
        return [...orErrors, ...errors];
    }
    print() {
        for (const name of Object.keys(this.allSchemas)) {
            console.log(name);
            const rules = this.allSchemas[name];
            for (const r of rules) {
                const optional = r.optional ? '(optional)' : '';
                console.log('   ' + r.propName + ' ' + optional);
                console.log(JSON.stringify(this.allSchemas), '\n\n');
            }
        }
    }
    validateObject(json, rule, errors) {
        const rules = rule.rules;
        let err = [];
        for (let k = 0; k < rules.length; k++) {
            const p = rules[k];
            const value = json[p.propName];
            err = this.validate(p, value);
            errors.push(...err);
        }
        return err.length === 0 ? true : false;
    }
    validateIsArray(value, rule, errors) {
        const exptectedType = rule.type;
        if (Array.isArray(value)) {
            if (exptectedType === BaseTypes.Any) {
                return true;
            }
            else if (exptectedType === BaseTypes.Enum) {
                const possibleValues = rule.value;
                for (const i of value) {
                    if (possibleValues.indexOf(i) === -1) {
                        errors.push(`Array contains values not allowed: ${JSON.stringify(value)}`);
                        return false;
                    }
                }
            }
            else if (exptectedType === BaseTypes.Object) {
                for (var i = 0; i < value.length; i++) {
                    this.validateObject(value[i], rule, errors);
                }
                return errors.length === 0 ? true : false;
            }
            else {
                for (const i of value) {
                    if (typeof i !== exptectedType) {
                        errors.push(`Array not well formed: ${JSON.stringify(value)}`);
                        return false;
                    }
                }
            }
            return true;
        }
        errors.push(`Not an array: ${JSON.stringify(value)}`);
        return false;
    }
}
//# sourceMappingURL=validator.js.map
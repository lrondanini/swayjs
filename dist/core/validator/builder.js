import { Project } from "ts-morph";
export var ValidationRule;
(function (ValidationRule) {
    ValidationRule["IsType"] = "IsType";
    ValidationRule["IsArray"] = "IsArray";
    ValidationRule["IsObject"] = "IsObject";
    ValidationRule["MaxLength"] = "MaxLength";
    ValidationRule["MinLength"] = "MinLength";
    ValidationRule["Contains"] = "Contains";
    ValidationRule["Format"] = "Format";
    ValidationRule["Max"] = "Max";
    ValidationRule["Min"] = "Min";
    ValidationRule["Custom"] = "Custom";
})(ValidationRule || (ValidationRule = {}));
export var BaseTypes;
(function (BaseTypes) {
    BaseTypes["String"] = "string";
    BaseTypes["Number"] = "number";
    BaseTypes["Boolean"] = "boolean";
    BaseTypes["Enum"] = "enum";
    BaseTypes["Any"] = "any";
    BaseTypes["Unknown"] = "unknown";
    BaseTypes["Object"] = "object";
})(BaseTypes || (BaseTypes = {}));
const utilForMatching = [ValidationRule.MaxLength, ValidationRule.MinLength, ValidationRule.Contains, ValidationRule.Format, ValidationRule.Min, ValidationRule.Max, ValidationRule.Custom];
const utilForParsingTypes = ['.minlength', '.contains', '.max', '.min', '.maxlength', '.format', '.custom',];
export default class ValidatorFactory {
    constructor() {
        this.currentParsedFile = '';
        this.currentParsedClass = '';
    }
    parseParameter(param, typeChecker) {
        let isOptional = this.isOptional(param.getName(), param.getText());
        const paramType = typeChecker.getTypeAtLocation(param);
        const rules = this.parseType(paramType, param.getText());
        return {
            propName: param.getName(),
            optional: isOptional,
            rules: rules,
        };
    }
    getEnumValues(filPath, enumName) {
        const project = new Project();
        let sourceFiles = project.addSourceFilesAtPaths(filPath + ".ts");
        if (sourceFiles.length == 0) {
            sourceFiles = project.addSourceFilesAtPaths(filPath + ".tsx");
        }
        if (sourceFiles.length == 0) {
            throw new Error('File not found: ' + filPath + ".ts");
        }
        const res = [];
        sourceFiles.forEach((sourceFile) => {
            sourceFile.getEnums().forEach((enumDef) => {
                if (enumDef.getName() == enumName) {
                    enumDef.getMembers().forEach((member) => {
                        res.push(member.getName());
                    });
                }
            });
        });
        return res;
    }
    parseProperty(prop) {
        const propName = prop.getName();
        const type = prop.getType();
        const propRules = {
            propName: propName,
            optional: false,
            rules: {
                and: [],
                or: [],
            },
        };
        if (this.isOptional(propName, prop.getText())) {
            propRules.optional = true;
        }
        propRules.rules = this.parseType(type, prop.getText());
        return propRules;
    }
    parseType(type, propName) {
        let rules = {
            and: [],
            or: [],
        };
        if (type.isBoolean()) {
            rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.Boolean, key: 'is-type-boolean' });
        }
        else if (type.isEnum()) {
            const path = type.getText().split('.');
            let values = [];
            if (path.length > 1) {
                const src = path[0].replace("import(\"", "").replace("\")", "");
                values = this.getEnumValues(src, path[1]);
            }
            else {
                values = this.getEnumValues(this.currentParsedFile.replace(".ts", "").replace(".tsx", ""), path[0]);
            }
            rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.Enum, value: values, key: 'is-type-enum' + JSON.stringify(values) });
        }
        else if (type.isIntersection()) {
            type.getIntersectionTypes().forEach((intType) => {
                rules.and = [...rules.and, ...this.parseType(intType, propName).and];
            });
        }
        else if (type.isUnion()) {
            type.getUnionTypes().forEach((intType) => {
                rules.or.push(this.parseType(intType, propName).and);
            });
        }
        else if (type.isArray()) {
            rules.and = [...rules.and, ...this.parseArray(type, propName)];
        }
        else if (type.isLiteral()) {
            console.log(' isLiteral');
        }
        else if (type.isNumber()) {
            rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.Number, key: 'is-type-number' });
        }
        else if (type.isObject()) {
            if (this.isValidationRule(type.getText().toLowerCase())) {
                const t = type.getText().split('.');
                const rule = t[t.length - 1];
                rules.and.push(this.parseValidationRule(rule));
            }
            else {
                const path = type.getText().split('.');
                const src = path[0].replace("import(\"", "").replace("\")", "");
                if (!path[1]) {
                    throw new Error('Object type not found or exported: ' + type.getText());
                }
                const objProRules = this.parseObject(src, path[1]);
                rules.and.push({ rule: ValidationRule.IsObject, type: BaseTypes.Any, key: 'is-type-object', rules: objProRules });
            }
        }
        else if (type.isString()) {
            rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.String, key: 'is-type-string' });
        }
        else if (type.isAny) {
            rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.Any, key: 'is-type-any' });
        }
        return rules;
    }
    parseObject(filPath, objectName) {
        const validationRules = [];
        const project = new Project();
        let sourceFiles = project.addSourceFilesAtPaths(filPath + ".ts");
        if (sourceFiles.length == 0) {
            sourceFiles = project.addSourceFilesAtPaths(filPath + ".tsx");
        }
        if (sourceFiles.length == 0) {
            throw new Error('File not found: ' + filPath + ".ts");
        }
        sourceFiles.forEach((sourceFile) => {
            this.currentParsedFile = sourceFile.getFilePath();
            let found = false;
            const classes = sourceFile.getClasses();
            classes.forEach((classDef) => {
                if (classDef.getName() == objectName) {
                    found = true;
                    classDef.getProperties().forEach((prop) => {
                        this.currentParsedClass = classDef.getName();
                        validationRules.push(this.parseProperty(prop));
                    });
                }
            });
            if (!found) {
                const interfaces = sourceFile.getInterfaces();
                interfaces.forEach((interfaceDef) => {
                    if (interfaceDef.getName() == objectName) {
                        interfaceDef.getProperties().forEach((prop) => {
                            this.currentParsedClass = interfaceDef.getName();
                            validationRules.push(this.parseProperty(prop));
                        });
                    }
                });
            }
        });
        return validationRules;
    }
    parseArray(type, propName) {
        let rules = [];
        const t = this.parseType(type.getArrayElementType(), propName).and;
        if (t.length == 1) {
            if (t[0].type == BaseTypes.Enum) {
                const path = type.getText().split('.');
                const src = path[0].replace("import(\"", "").replace("\")", "");
                const values = this.getEnumValues(src, path[1].replace("[", "").replace("]", ""));
                rules.push({ rule: ValidationRule.IsArray, type: t[0].type, value: values, key: 'is-array-of-' + t[0].type + JSON.stringify(values) });
            }
            else if ((t[0].rule == ValidationRule.IsObject) && t[0].rules && t[0].rules.length > 0) {
                rules.push({ rule: ValidationRule.IsArray, type: BaseTypes.Object, fullType: type.getText(), key: 'is-array-of-object', rules: t[0].rules });
            }
            else {
                rules.push({ rule: ValidationRule.IsArray, type: t[0].type, key: 'is-array-of-' + t[0].type });
            }
        }
        else {
            throw new Error('Validation not supported for ' + this.currentParsedClass + '.' + propName + ' (' + this.currentParsedFile + ')');
        }
        return rules;
    }
    getRuleName(rule) {
        for (const item of utilForMatching) {
            if (rule.includes(item)) {
                return item;
            }
        }
    }
    isValidationRule(rule) {
        for (const item of utilForMatching) {
            if (rule.includes(item)) {
                return true;
            }
        }
        return false;
    }
    parseValidationRule(rule) {
        const ruleName = this.getRuleName(rule);
        let regex = new RegExp(String.raw `^${ruleName}\s*<\s*(.*)\s*>`);
        switch (ruleName) {
            case ValidationRule.MinLength:
            case ValidationRule.Contains:
            case ValidationRule.Min:
            case ValidationRule.Max:
            case ValidationRule.MaxLength: {
                const matches = regex.exec(rule);
                let value = parseInt(matches[1]);
                if (ruleName == ValidationRule.Contains) {
                    if (Number.isNaN(value)) {
                        value = JSON.parse(matches[1]);
                    }
                }
                return {
                    rule: ruleName,
                    value: value,
                    key: ruleName + value,
                };
            }
            case ValidationRule.Custom:
            case ValidationRule.Format: {
                const matches = regex.exec(rule);
                let value = JSON.parse(matches[1]);
                return {
                    rule: ruleName,
                    value: value,
                    key: ruleName + value,
                };
            }
        }
    }
    isOptional(name, input) {
        let regex = new RegExp(String.raw `^${name.trim()}(\s*)\?(\s*):(.*)`);
        return regex.test(input);
    }
}
//# sourceMappingURL=builder.js.map
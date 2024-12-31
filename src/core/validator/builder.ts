import { ParameterDeclaration, Project, PropertyDeclaration, PropertySignature, Type, TypeChecker } from "ts-morph";
import { Validator } from "./validator";

export enum ValidationRule {
  IsType = 'IsType',
  IsArray = 'IsArray',
  IsObject = 'IsObject',
  MaxLength = 'MaxLength',
  MinLength = 'MinLength',
  Contains = 'Contains',
  Format = 'Format',
  Max = 'Max',
  Min = 'Min',
  Custom = 'Custom',
}

export enum BaseTypes {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Enum = 'enum',
  Any = 'any',
  Unknown = 'unknown',
  Object = 'object',
}

export type ValidationRuleSetting = {
  key: string; //to identify the rule and skip multiple evaluations
  rule: ValidationRule;
  type?: BaseTypes;
  fullType?: string;
  value?: number | string | boolean | string[] | number[] | boolean[];
  rules?: PropRules[]; //for nested objects
}

export type ValidationRules = {
  and: ValidationRuleSetting[];
  or: ValidationRuleSetting[][];
}

export type PropRules = {
  propName: string;
  optional: boolean;
  rules: ValidationRules;
}

const utilForMatching = [ValidationRule.MaxLength, ValidationRule.MinLength, ValidationRule.Contains, ValidationRule.Format, ValidationRule.Min, ValidationRule.Max, ValidationRule.Custom];

export default class ValidatorFactory {
  private currentParsedFile: string = '';
  private currentParsedClass: string = '';

  constructor() {
  }

  // testCreateValidator(): Validator {
  //   const validator = new Validator();
  //   const project = new Project();
  //   const sourceFiles = project.addSourceFilesAtPaths(`./routes/test.ts`);

  //   sourceFiles.forEach((sourceFile) => {
  //     this.currentParsedFile = sourceFile.getFilePath();

  //     const classes = sourceFile.getClasses();
  //     classes.forEach((classDef) => {
  //       // console.log(classDef.getName());
  //       classDef.getImplements().forEach((impl) => {
  //         const requiresValidation = impl.getText().toLowerCase() === 'requiresvalidation';
  //         if (requiresValidation) {
  //           //class with functions to validate:
  //           const methods = classDef.getMethods();
  //           methods.forEach((method) => {
  //             //in reality here we parse only routes methods.....Get, Post, .....
  //             //here for testing we parse them all
              
  //             const validationRules: PropRules[] = [];
  //             method.getParameters().forEach((param) => {
  //               //PROD will need method name (to map the route methods), validator for the param
  //               this.currentParsedClass = classDef.getName();
  //               validationRules.push(this.parseParameter(param, project.getTypeChecker()));
  //             });

  //             // console.log(validationRules);
  //             validator.addSchema(classDef.getName(), method.getName(), validationRules);
  //           });

            
  //         }
  //       });
  //     });
  //   });

  //   return validator;

  // }

  parseParameter(param: ParameterDeclaration, typeChecker: TypeChecker): PropRules {

    let isOptional = this.isOptional(param.getName(), param.getText());

    const paramType = typeChecker.getTypeAtLocation(param);

    const rules = this.parseType(paramType, param.getText());

    // console.log("RULES: ", JSON.stringify(rules, null, 2));

    return {
      propName: param.getName(),
      optional: isOptional,
      rules: rules,      
    } as PropRules;

  }

  private getEnumValues(filPath: string, enumName: string): string[] {
    const project = new Project();
    let sourceFiles = project.addSourceFilesAtPaths(filPath + ".ts");

    if (sourceFiles.length == 0) {
      sourceFiles = project.addSourceFilesAtPaths(filPath + ".tsx");
    }

    if (sourceFiles.length == 0) {
      throw new Error('File not found: ' + filPath + ".ts");
    }

    const res: string[] = [];
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

  private parseProperty(prop: PropertyDeclaration | PropertySignature): PropRules {
    const propName = prop.getName();
    const type = prop.getType();

    const propRules: PropRules = {
      propName: propName,
      optional: false,
      rules: {
        and: [],
        or: [],
      },
    }


    if (this.isOptional(propName, prop.getText())) {
      propRules.optional = true;
    }

    propRules.rules = this.parseType(type, prop.getText());

    return propRules;
  }

  private parseType(type: Type, propName: string): ValidationRules {

    let rules: ValidationRules = {
      and: [],
      or: [],
    }
    if (type.isBoolean()) {
      //keep this before union, as boolean is a union of true | false
      rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.Boolean, key: 'is-type-boolean' });
    } else if (type.isEnum()) {
      //keep this before union, as enum is a union of all enum values (eg value1 | value2 | value3 | ....)      
      const path = type.getText().split('.');
      let values = [];
      if (path.length > 1) {
        const src = path[0].replace("import(\"", "").replace("\")", "");
        values = this.getEnumValues(src, path[1]);
      } else {
        //its inside current file
        values = this.getEnumValues(this.currentParsedFile.replace(".ts", "").replace(".tsx", ""), path[0]);
      }
      rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.Enum, value: values, key: 'is-type-enum' + JSON.stringify(values) });
    } else if (type.isIntersection()) {
      // console.log(type.getIntersectionTypes());
      type.getIntersectionTypes().forEach((intType) => {
        rules.and = [...rules.and, ...this.parseType(intType, propName).and];
      });
    } else if (type.isUnion()) {
      type.getUnionTypes().forEach((intType) => {
        rules.or.push(this.parseType(intType, propName).and);
      });
    } else if (type.isArray()) {
      rules.and = [...rules.and, ...this.parseArray(type, propName)];
    } else if (type.isLiteral()) {
      ///TODO---------------------------------------
      ///TODO---------------------------------------
      ///TODO---------------------------------------
      console.log(' isLiteral');
    } else if (type.isNumber()) {
      rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.Number, key: 'is-type-number' }); 
    } else if (type.isObject()) {
      if (type.getText().toLowerCase().includes('ValidationRule'.toLowerCase())) {
        const t = type.getText().split('.');
        const rule = t[t.length - 1];
        rules.and.push(this.parseValidationRule(rule));
      } else {
        //some object (ignore validation rules of subobject for this release)
        const path = type.getText().split('.');
        const src = path[0].replace("import(\"", "").replace("\")", "");

        if(!path[1]) {
          throw new Error('Object type not found or exported: ' + type.getText());
        }

        const objProRules = this.parseObject(src, path[1]);
        rules.and.push({ rule: ValidationRule.IsObject, type: BaseTypes.Any, key: 'is-type-object', rules:  objProRules});
      }
    } else if (type.isString()) {
      rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.String, key: 'is-type-string' });
    } else if (type.isAny) {
      //keep this as last, any is a superset of all types      
      rules.and.push({ rule: ValidationRule.IsType, type: BaseTypes.Any, key: 'is-type-any' });//includes any, undefined and null  
    }


    return rules;
  }

  private parseObject(filPath: string, objectName: string): PropRules[] {
    const validationRules: PropRules[] = [];
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
        if(classDef.getName() == objectName) {
          found = true;
          classDef.getProperties().forEach((prop) => {
            this.currentParsedClass = classDef.getName();
            validationRules.push(this.parseProperty(prop));
          });
        }
      });

      if(!found) {
        const interfaces = sourceFile.getInterfaces();
        interfaces.forEach((interfaceDef) => {
          if(interfaceDef.getName() == objectName) {
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

  private parseArray(type: Type, propName: string) {
    let rules: ValidationRuleSetting[] = [];
    const t = this.parseType(type.getArrayElementType(), propName).and;
    if (t.length == 1) {
      if (t[0].type == BaseTypes.Enum) {
        const path = type.getText().split('.');
        const src = path[0].replace("import(\"", "").replace("\")", "");
        const values = this.getEnumValues(src, path[1].replace("[", "").replace("]", ""));
        rules.push({ rule: ValidationRule.IsArray, type: t[0].type, value: values, key: 'is-array-of-' + t[0].type + JSON.stringify(values) });
      } else if((t[0].rule == ValidationRule.IsObject) && t[0].rules && t[0].rules.length > 0) {
        rules.push({ rule: ValidationRule.IsArray, type: BaseTypes.Object, fullType: type.getText(), key: 'is-array-of-object', rules: t[0].rules  });
      } else {
        rules.push({ rule: ValidationRule.IsArray, type: t[0].type, key: 'is-array-of-' + t[0].type});
      }
    } else {
      //what is not supported????
      throw new Error('Validation not supported for ' + this.currentParsedClass + '.' + propName + ' (' + this.currentParsedFile + ')');
    }
    // console.log(rules);
    return rules;
  }

  private getRuleName(rule: string): ValidationRule {
    for (const item of utilForMatching) {
      if (rule.includes(item)) {
        return item;
      }
    }
  }

  private parseValidationRule(rule: string): ValidationRuleSetting {
    const ruleName: ValidationRule = this.getRuleName(rule);
    let regex = new RegExp(String.raw`^${ruleName}\s*<\s*(.*)\s*>`);

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

  private isOptional(name: string, input: string) {
    // /^base(\s*)\?(\s*):(.*)/
    let regex = new RegExp(String.raw`^${name.trim()}(\s*)\?(\s*):(.*)`);
    return regex.test(input);
  }

}
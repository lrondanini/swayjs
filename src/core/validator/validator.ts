
import { validateContains, validateFormat, validateIsType, validateMaxLength, validateMinLength } from "./types-validators";
import { BaseTypes, PropRules, ValidationRule, ValidationRuleSetting } from "./builder";

export type ValidationResults = {
  passed: boolean;
  errors: string[];
}

export type ValidationFunction = (value: any) => boolean;

export class Validator {
  private allSchemas: { [propName: string]: PropRules[] };
  private customValidationFunctions: { [name: string]: ValidationFunction };
  private VALIDATE_FUNCTIONS: { [name: string]: Function };

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

  addSchema(route: string, methodName: string, rules: PropRules[]) {
    this.allSchemas[route + "-" + methodName] = rules;
  }

  addValidationFunction(name: string, func: ValidationFunction) {
    this.customValidationFunctions[name] = func;
  }

  private validateWithCustomFunction(value: any, rule: ValidationRuleSetting): boolean {
    const func = this.customValidationFunctions[rule.value as string];
    if (func) {
      return func(value);
    }
    return false;
  }

  testValidation(schemaName: string, methodName: string, json: any): ValidationResults {
    const props = this.allSchemas[schemaName + "-" + methodName]; //PropRules[]

    let errors: string[] = [];

    for (let k = 0; k < props.length; k++) {
      const p = props[k];
      // console.log(JSON.stringify(p));
      // const value: any = json[p.propName];


      errors = [...errors, ...this.validate(p, json)];
    }

    console.log(errors);

    return {
      passed: errors.length === 0 ? true : false,
      errors: errors
    };
  }

  parseQueryString(p: PropRules, value: any): any {

    let parsedValue = value;

    for (let i = 0; i < p.rules.and.length; i++) {
      const r = p.rules.and[i];
      if (r.rule === ValidationRule.IsObject) {
        if(typeof value === 'string') {
          value = JSON.parse(value);
        } 
        parsedValue = this.parseQueryString_Object(value, r);
      } else if (r.rule === ValidationRule.IsArray) {
        if(typeof value === 'string' && r.type != BaseTypes.String) {
          value = JSON.parse(value);
        } 
        parsedValue = this.parseQueryString_Array(value, r);
      } else if(r.rule === ValidationRule.IsType) {
        if (r.type === BaseTypes.Number) {
          if(typeof value === 'string') {
            parsedValue = JSON.parse(value);
          } 
        } else if (r.type === BaseTypes.Boolean) {
          if(typeof value === 'string') {
            parsedValue = parsedValue.toLowerCase() === 'true' ? true : false;
          } 
        } 
      }
    }


    for (let j = 0; j < p.rules.or.length; j++) {
      const orR = p.rules.or[j];
      for (const r of orR) {
          if (r.rule === ValidationRule.IsObject) {
            if(typeof value === 'string') {
              value = JSON.parse(value);
            } 
            parsedValue = this.parseQueryString_Object(value, r);
          } else if (r.rule === ValidationRule.IsArray) {
            if(typeof value === 'string' && r.type != BaseTypes.String) {
              value = JSON.parse(value);
            } 
            parsedValue = this.parseQueryString_Array(value, r);
          } else if(r.rule === ValidationRule.IsType) {
            if (r.type === BaseTypes.Number) {
              if(typeof value === 'string') {
                parsedValue = JSON.parse(value);
              } 
            } else if (r.type === BaseTypes.Boolean) {
              if(typeof value === 'string') {
                parsedValue = parsedValue.toLowerCase() === 'true' ? true : false;
              } 
            } 
          }
      }
    }

    return parsedValue;
    
  }

  private parseValue(value: any, r: ValidationRuleSetting): any {

    let parsedValue = value;

    if (r.rule === ValidationRule.IsObject) {
      if(typeof value === 'string') {
        value = JSON.parse(value);
      } 
      parsedValue = this.parseQueryString_Object(value, r);
    } else if (r.rule === ValidationRule.IsArray) {
      if(typeof value === 'string' && r.type != BaseTypes.String) {
        value = JSON.parse(value);
      } 
      parsedValue = this.parseQueryString_Array(value, r);
    } else if(r.rule === ValidationRule.IsType) {
      if (r.type === BaseTypes.Number) {
        if(typeof value === 'string') {
          parsedValue = JSON.parse(value);
        } 
      } else if (r.type === BaseTypes.Boolean) {
        if(typeof value === 'string') {
          parsedValue = parsedValue.toLowerCase() === 'true' ? true : false;
        } 
      } 
    }

    return parsedValue;
  }

  private parseQueryString_Object(json: any, rule: ValidationRuleSetting): any {
    let parsedValue = json;

    const rules = rule.rules;
    for (let k = 0; k < rules.length; k++) {
      const p = rules[k];
      let value: any = json[p.propName];    
      if(value === undefined) {
        value = json[p.propName+"[]"];  
      } 
      parsedValue[p.propName] = this.parseQueryString(p, value);      
    }

    return parsedValue;
  }

  private parseQueryString_Array(value: any, rule: ValidationRuleSetting): any {

    let parsedValue = value;

    const exptectedType = rule.type;
    if (Array.isArray(value)) {
      if (exptectedType === BaseTypes.Object) {
        let tmp = [];
        for (var i = 0; i < value.length; i++) {
          tmp.push(this.parseQueryString_Object(value[i], rule));
        }
        parsedValue = tmp;
      } else {
        let tmp = [];
        for (var i = 0; i < value.length; i++) {
          tmp.push(this.parseValue(value[i], rule));          
        }
        parsedValue = tmp;
      }
    } 
    return parsedValue;
  }

  /***************************************/
  /**********  VALIDATION FUNCTIONS ******/
  /***************************************/

  validate(p: PropRules, value: any): string[] {
    let errors: string[] = [];

    if (p.optional && value === undefined) {
      return errors;
    }

    if (!p.optional && value === undefined) {
      errors.push(`${p.propName}: is required`)
      return errors;
    }

    const validationCache: { [key: string]: boolean } = {};
    for (let i = 0; i < p.rules.and.length; i++) {
      const r = p.rules.and[i];
      const key = r.key;
      if (validationCache[key]) {
        continue;
      } else {
        let passed = false;
        if (r.rule === ValidationRule.IsObject) {
          passed = this.validateObject(value, r, errors);
        } else if (r.rule === ValidationRule.IsArray) {
          passed = this.validateIsArray(value, r, errors);
        } else {
          passed = this.VALIDATE_FUNCTIONS[r.rule](value, r);
          if (!passed) {
            errors.push(`${p.propName}: expected ${r.rule} ${r.type ? JSON.stringify(r.type) : ''} ${r.fullType ? JSON.stringify(r.fullType) : ''} ${r.value ? JSON.stringify(r.value) + ' ' : ' '}to pass found: ${JSON.stringify(value)}`)
          }
        }
        validationCache[key] = passed;
      }
    }

    let orErrors: string[] = [];
    for (let j = 0; j < p.rules.or.length; j++) {
      const orR = p.rules.or[j];
      let tmpErrors = [];
      for (const r of orR) {
        const key = r.key;
        if (validationCache[key]) {
          continue;
        } else {
          let passed = false;
          if (r.rule === ValidationRule.IsObject) {
            passed = this.validateObject(value, r, errors);
          } else if (r.rule === ValidationRule.IsArray) {
            passed = this.validateIsArray(value, r, errors);
          } else {
            passed = this.VALIDATE_FUNCTIONS[r.rule](value, r);
            if (!passed) {
              tmpErrors.push(`${p.propName}: expected ${r.rule} ${r.type ? JSON.stringify(r.type) : ''} ${r.fullType ? JSON.stringify(r.fullType) : ''} ${r.value ? JSON.stringify(r.value) + ' ' : ' '}to pass found: ${JSON.stringify(value)}`)
            }
          }
          validationCache[key] = passed;
        }
      }
      if (tmpErrors.length === 0) {
        //we have at least one matching set of rules
        orErrors = [];
        break;
      } else {
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
        // console.log(r);
        const optional = r.optional ? '(optional)' : ''
        console.log('   ' + r.propName + ' ' + optional)

        console.log(JSON.stringify(this.allSchemas), '\n\n');
      }
    }
  }

  private validateObject(json: any, rule: ValidationRuleSetting, errors: string[]): boolean {
    const rules = rule.rules;
    let err: string[] = [];
    for (let k = 0; k < rules.length; k++) {
      const p = rules[k];
      const value: any = json[p.propName];      
      err = this.validate(p, value);
      errors.push(...err);
    }
    return err.length === 0 ? true : false;
  }


  private validateIsArray(value: any, rule: ValidationRuleSetting, errors: string[]): boolean {
    const exptectedType = rule.type;
    if (Array.isArray(value)) {
      if (exptectedType === BaseTypes.Any) {
        return true;
      } else if (exptectedType === BaseTypes.Enum) {
        const possibleValues = rule.value as string[];
        for (const i of value) {
          if (possibleValues.indexOf(i) === -1) {
            errors.push(`Array contains values not allowed: ${JSON.stringify(value)}`);
            return false;
          }
        }
      } else if (exptectedType === BaseTypes.Object) {
        for (var i = 0; i < value.length; i++) {
          this.validateObject(value[i], rule, errors);
        }
        return errors.length === 0 ? true : false;
      } else {
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
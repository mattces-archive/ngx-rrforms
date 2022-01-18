import {ValidatorFn} from "@angular/forms";
import {Observable} from "rxjs";

export type RRFormConditionalLogic = ((value: any) => boolean)[];
export type RRFormConditionalValidatorLogic = { logic: RRFormConditionalLogic, validators: ValidatorFn[] }[];

export type RRFormValidate = 'validate';
export type RRFormDisable = 'disable';

export type RRFormControl = {
  disable: () => RRFormConditionalInterface<RRFormDisable>;
  validate: () => RRFormConditionalInterface<RRFormValidate>
}


export type RRFormConditionalInterface<T extends RRFormDisable | RRFormValidate> = {
  when: T extends RRFormValidate
    ? (...conditionalLogic: RRFormConditionalValidatorLogic) => void
    : (...conditionalLogic: RRFormConditionalLogic) => void,

  whenEvent: T extends RRFormValidate
    ? (eventName: string, ...conditionalLogic: RRFormConditionalValidatorLogic) => void
    : (eventName: string, ...conditionalLogic: RRFormConditionalLogic) => void
}

export type RRFormActions = 'disable' | 'validate';
export type RRLogic = {
  path: string;
  action: RRFormActions,
  logicFunctions: RRFormConditionalLogic | RRFormConditionalValidatorLogic;
}

import {ValidatorFn} from "@angular/forms";

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
    : (...conditionalLogic: RRFormConditionalLogic) => void
}

export type RRFormActions = 'disable' | 'validate';
export type RRLogic = {
  path: string;
  action: RRFormActions,
  logicFunctions: RRFormConditionalLogic | RRFormConditionalValidatorLogic;
}

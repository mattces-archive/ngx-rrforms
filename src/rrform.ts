import {AbstractControl, FormControl, ValidatorFn} from "@angular/forms";
import {Observable, Subscription} from "rxjs";
import {EventEmitter} from "@angular/core";
import {
  RRFormActions,
  RRFormConditionalInterface,
  RRFormConditionalLogic,
  RRFormConditionalValidatorLogic,
  RRFormControl, RRFormDisable,
  RRFormValidate,
  RRLogic
} from "./doc-types";

export class RRForm {
  constructor(private _control: AbstractControl) {
    this._changeEvent = new EventEmitter<[string, any]>();
    this._changeEvent?.subscribe(([eventName, eventValue]) => {
      this.runLogic(eventName, eventValue);
    });
    this.addObservable('valueChanged', this._control.valueChanges);

    if (_control instanceof FormControl) {
      throw new Error('Passed in control cannot be of type FormControl. Try using AbstractControl, FormGroup, FormArray.');
    }
  }

  private evaluateConditionalLogic =
    (action: RRFormActions, logicFunctions: RRFormConditionalLogic | RRFormConditionalValidatorLogic):
      { add: ValidatorFn[], remove: ValidatorFn[] } | boolean => {
      switch (action) {
        case "disable":
          for (const fn of logicFunctions as RRFormConditionalLogic)
            if (fn(this._control.value))
              return true;
          return false;
        case "validate":
          const validatorsToBeRemoved = new Set<ValidatorFn>();
          const validatorsToBeAdded = new Set<ValidatorFn>();
          for (const logic of logicFunctions as RRFormConditionalValidatorLogic) {
            for (let fn of logic.logic)
              if (fn(this._control.value)) logic.validators.forEach(validator => validatorsToBeAdded.add(validator));
              else {
                logic.validators.forEach(validator => validatorsToBeRemoved.add(validator));
                break;
              }
          }
          return {add: Array.from(validatorsToBeAdded), remove: Array.from(validatorsToBeRemoved)};
      }
    }

  private runLogic(eventName: string, eventValue: any) {
    this._logic.forEach((logicObject) => {
      let evaluated = this.evaluateConditionalLogic(logicObject.action, logicObject.logicFunctions);
      if (typeof evaluated === 'boolean') {
        let control = this._control.get(logicObject.path);

        if (evaluated && control?.enabled)
          control?.disable();
        if (!evaluated && control?.disabled)
          control?.enable();
      } else {
        let control = this._control.get(logicObject.path);

        for (let validator of evaluated.add)
          if (!control?.hasValidator(validator))
            control?.addValidators(validator);
        for (let validator of evaluated.remove)
          if (control?.hasValidator(validator))
            control?.removeValidators(validator);

        control?.updateValueAndValidity({emitEvent: false});

      }
    })
  }

  /**
   * Returns object with functions to add conditional logic to a child control.
   * @param path {Array<number | string> | string} the path to the child control, as in <b style="whitespace: nowrap;"><i>control.get(path)</i></b>
   */
  public control(path: Array<number | string> | string): RRFormControl {
    const when = (action: RRFormActions, ...conditionalLogic: RRFormConditionalLogic | RRFormConditionalValidatorLogic) => {
      this._logic.push({
        path: typeof path === 'string' ? path : path.join('.'),
        action,
        logicFunctions: conditionalLogic
      })
    }
    const disable = () =>
      ({when: (...conditionalLogic: RRFormConditionalLogic) => when('disable', ...conditionalLogic)}) as RRFormConditionalInterface<RRFormDisable>;
    const validate = () =>
      ({when: (...conditionalLogic: RRFormConditionalValidatorLogic) => when('validate', ...conditionalLogic)}) as RRFormConditionalInterface<RRFormValidate>;
    return {
      disable: disable,
      validate: validate,
    }
  }

  private addObservable(eventName: string, observable: Observable<any>):
    void {
    if (this._observables.includes(observable))
      return;
    this._observables.push(observable);
    this._subscriptions.push(this._observables[this._observables.length - 1]?.subscribe((value) => {
      this._changeEvent.emit([eventName, value]);
    }))
  }

  /*
    public removeObservable(observable: Observable<any>):
      void {
      if (!
        this._observables.includes(observable)
      )
        return;

      const index = this._observables.indexOf(observable);
      this._subscriptions[index].unsubscribe()

      this._observables.splice(index, 1);
      this._subscriptions.splice(index, 1);
    }*/

  private _logic: RRLogic[] = [];

  private _changeEvent: EventEmitter<[string, any]>;
  private _observables: Observable<any>[] = [];
  private _subscriptions: Subscription[] = [];

  public destroy() {
    this._subscriptions.forEach(sub => sub?.unsubscribe());
  }
}

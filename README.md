## ngx-rrforms

_**Reactive**_ Reactive Forms for Angular 2+. Declarative reactive form validation and disabling.

### CONTENT TABLE

- [Usage examples](#examples)
  - [conditional disabling (on value change)](#conditional-disabling)
  - [conditional validators (on value change)](#conditional-validators)
  - [reacting to outside observables](#reacting-to-observables)
- [**API** documentation](#api)

## INSTALLATION

Run this command:

```
npm i --save ngx-rrforms
```

## **OVERVIEW**

This library aims to improve the reactivity of Angular's inbuilt reactive forms by providing a simple utility in the
form of the `RRForm` class that greatly simplifies implementing conditional behaviour (eg. conditional rendering,
validation) that depends on the form's own `valueChanges` or outside observables.

# EXAMPLES

In the below examples, a field is displayed **only** when its status is not `DISABLED`.

## CONDITIONAL DISABLING

Below code shows the simplest way `RRForm` can be used, which is to disable and enable a control depending on another
control's value.

```ts
import {Component, OnDestroy} from '@angular/core';
import {RRForm} from "ngx-rrforms";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      name: '',
      surname: {value: '', disabled: true},
    })

    this.rr = new RRForm(this.formGroup);
    this.rr.control('surname').disable().when((value) => value.name?.length < 5);
  }

  ngOnDestroy(): void {
    this.rr.destroy();
  }

  rr: RRForm;
  formGroup: FormGroup
}
```

The above code will disable the surname control if the length of the `name` control's value is less than 5. It will
re-enable it if it's equal to or more than five.
\
\
This is how it works live:

<img src="https://i.imgur.com/adhVhqb.gif">

## CONDITIONAL VALIDATORS

The code below implements the simplest use of conditional addition and removal of validators from controls.

```ts
import {Component, OnDestroy, OnInit} from '@angular/core';
import {RRForm} from "ngx-rrforms";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      name: '',
      surname: {value: '', disabled: true},
    })

    this.rr = new RRForm(this.formGroup);
    this.rr.control('surname').disable().when((value) => value.name?.length < 5);
    this.rr.control('surname').validate().when(
      {
        logic: [(value) => value.name?.length > 7],
        validators: [Validators.maxLength(6), Validators.required]
      },
    );
  }

  ngOnDestroy(): void {
    this.rr.destroy();
  }

  rr: RRForm;
  formGroup: FormGroup
}
```

In the above code, the `surname` control will be disabled on the same condition as in the previous example, but in
addition to that, if the length of the `name` control's value is greater than§ 5, it will add the `maxlength`
and `required` validators to the `surname` control.

This is how it looks live:\
\
<img src="https://i.imgur.com/F6h2lP4.gif">

## REACTING TO OBSERVABLES

The default observable that updates the form is its own `valueChanges` observable. However, if you'd like the form to
react to outside events, instead of using `when`, use `whenEvent`. You can use the `addObservable` method to add an
observable the form can react to.

```ts
import {Component, OnDestroy, OnInit} from '@angular/core';
import {RRForm} from "ngx-rrforms";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {interval, observable} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      name: '',
      surname: {value: '', disabled: true},
    })


    this.rr = new RRForm(this.formGroup);

    this.rr.addObservable('test', this.obs);

    this.rr.control('surname').validate().when(
      {
        logic: [(value) => value.name?.length > 7],
        validators: [Validators.maxLength(6), Validators.required]
      },
    );
    this.rr.control('surname').disable().whenEvent('test', (value) => value % 2 == 0)
  }

  ngOnDestroy(): void {
    this.rr.destroy();
  }

  rr: RRForm;
  obs = interval(300)
  formGroup: FormGroup
}
```

In the above example, the `obs` observable emits a value every 300ms. If the value emitted is even, the `surname` field
will be disabled. You can add conditional validators depending on outside events angalogically.

<img src="https://i.imgur.com/Z1foHcp.gif">

# API

- ## `RRForm`
  **constructor** `RRForm(control: AbstractControl)`

  The main class, the constructor takes in an `AbstractControl`
  object representing the form where conditional logic will be performed.\

  When changes are detected in the control passed into the constructor, logic from the
  `disable()` and `validate()` will be executed.

- ## `RRForm.control(path: Array<string | number> | string): RRFormControl`
  **param** `path: Array<string | number> | string` - the path to the control as would be used
  in `formGroup.get(path: Array<string | number> | string): AbstractControl`\
  \
  Returns an interface to add conditional rules to the control passed in the constructor. The object returned contains
  two methods, `disable()` and `validate()`.

- ## `RRForm.destroy(): void`

  Unsubscribes from all the observables used by the `RRForm` object. Make sure to run it inside `ngOnDestroy()`.

- ## `RRForm.addObservable(eventName: string, observable: Observable<any>): void`
  adds observable and assigns it an event name, to be used with the `whenEvent` methods.

## CONDITIONALS

- ### `RRFormControl.disable().when(...logicFunctions: RRConditionalLogic): RRFormConditionalInterface`

**param** `logicFunctions: ((value: any) => boolean)[]`: an unpacked array of functions of boolean return type.\
The `value: any` param is the value of the `control` passed into the constructor.

- conditionally disables the specified control if any of the functions passed in return true on form value change
- re-enables the control if any of the functions passed in return false on form value change

- ### `RRFormControl.validate().when(...logic: RRConditionalValidatorLogic): RRFormConditionalInterface`:

**param** `logic: {logic: ((value: any) => boolean)[], validators: ValidatorFn[]}[]`: an unpacked array of objects, each
containing an array of boolean return type functions in the `logic` attribute and an array of `ValidatorFn`
(eg. `Validators.required`) to be added when any of the `logic` functions returns true on form value change and removed
when any of them returns false on form value change.

- conditionally adds validators when any of the functions passed in return true on form value change
- removes those validators when any of the functions passed in return false on form value change

- ### `RRFormControl.disable().whenEvent(eventName: string, ...logicFunctions: RRConditionalLogic): RRFormConditionalInterface`

**param** `eventName: string`: the name of the event (added using `RRForm.addObservable`) to which the control should
react.\
\
**param** `logicFunctions: ((value: any) => boolean)[]`: an unpacked array of functions of boolean return type.\
The `value: any` param is the value emitted by the observable specified by the `eventName` param.

- conditionally disables the specified control if any of the functions passed in return true on observable emission
- re-enables the control if any of the functions passed in return false on observable emission

- ### `RRFormControl.validate().when(eventName: string, ...logic: RRConditionalValidatorLogic): RRFormConditionalInterface`:

**param** `eventName: string`: the name of the event (added using `RRForm.addObservable`) to which the control should
react.\
\
**param** `logic: {logic: ((value: any) => boolean)[], validators: ValidatorFn[]}[]`: an unpacked array of objects, each
containing an array of boolean return type functions in the `logic` attribute and an array of `ValidatorFn`
(eg. `Validators.required`) to be added when any of the `logic` functions returns true and removed when any of them
returns false (they're fired on observable emission). The `value: any` param is the value emitted by the observable
specified by the `eventName` param.

- conditionally adds validators when any of the functions passed in return true on observable emission
- removes those validators when any of the functions passed in return false on observable emission


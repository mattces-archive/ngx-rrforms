## ngx-rrforms

_**Reactive**_ Reactive Forms for Angular 2+. Self-reactivity and more (soon).

### CONTENT TABLE

- [Usage examples](#examples)
  - [conditional disabling](#conditional-disabling)
  - [conditional validators](#conditional-validators)
- [**API** documentation](#api)

## INSTALLATION

Run this command:

```
npm i --save ngx-rrforms
```

## **OVERVIEW**

This library aims to improve the reactivity of Angular's inbuilt reactive forms by providing a simple utility in the
form of the `RRForm` class that greatly simplifies implementing conditional behaviour (eg. conditional rendering,
validation) that depends on the form's own values. As of version 1.0.1 only self-reactivity has been implemented.

# EXAMPLES

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

## CONDITIONALS

- ### `RRFormControl.disable().when(...logicFunctions: RRConditionalLogic): RRFormConditionalInterface`

**param** `logicFunctions: ((value: any) => boolean)[]`: an unpacked array of functions of boolean return type.\
The `value: any` param is the value of the `control` passed into the constructor.

- conditionally disablse the specified control if any of the functions passed in return true on form value change
- re-enablse the control if any of the functions passed in return false on form value change

- ### `RRFormControl.validate().when(...logic: RRConditionalValidatorLogic): RRFormConditionalInterface`:

**param** `logic: {logic: ((value: any) => boolean)[], validators: ValidatorFn[]}[]`: an unpacked array of objects, each
containing an array of boolean return type functions in the `logic` attribute and an array of `ValidatorFn`
(eg. `Validators.required`) to be added when any of the `logic` functions returns true on form value change and removed
when any of them returns false on form value change.

- conditionally adds validators when any of the functions passed in return true on form value change
- removes those validators when any of the functions passed in return false on form value change


import { AbstractControl, ValidationErrors } from '@angular/forms';

export function belgianBankAccountValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const regex = /^\d{3}-\d{7}-\d{2}$/;

    if (!value) {
        return null; // Don't validate empty values to allow required validator to handle them
    }

    return regex.test(value) ? null : { invalidBelgianBankAccount: true };
}
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function validateBelgianBankAccount(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
        return null;
    }

    const cleanedValue = value.replace(/\s/g, '').toUpperCase();

    if (!/^BE[0-9]{14}$/.test(cleanedValue)) {
        return { invalidBelgianBankAccount: true };
    }

    const countryCode = cleanedValue.substring(0, 2);
    const checkDigits = cleanedValue.substring(2, 4);
    const bankCode = cleanedValue.substring(4, 7);
    const accountNumber = cleanedValue.substring(7);

    const rearranged = bankCode + accountNumber + '1114' + checkDigits;

    const modResult = BigInt(rearranged) % 97n;

    return modResult === 1n ? null : { invalidBelgianBankAccount: true };
}

export function validateEmail(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
        return null;
    }

    if (!/.+@.+\..+/.test(value)) {
        return { invalidEmail: true };
    }

    return null;
}

export function validateNationalRegistryNumber(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) {
        return { required: true };
    }

    const pattern = /^\d{2}\.\d{2}\.\d{2}-\d{3}\.\d{2}$/;
    if (!pattern.test(value)) {
        return { invalidFormat: true };
    }

    const [datePart, controlPart] = value.split('-');
    const [year, month, day] = datePart.split('.').map(Number);
    const [randomPart, checkPart] = controlPart.split('.').map(Number);

    const baseNumber = year >= 2000 ? `2${year}${month}${day}${randomPart}` : `${year}${month}${day}${randomPart}`;
    const checkNumber = 97 - (parseInt(baseNumber, 10) % 97);

    if (checkNumber !== checkPart) {
        return { invalidControlNumber: true };
    }

    return null;
}
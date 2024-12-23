import { Routes } from '@angular/router';
import { ClubRegistrationComponent } from './club-registration/club-registration.component';

export const routes: Routes = [
    {
        path: ':link',
        component: ClubRegistrationComponent
    },
];
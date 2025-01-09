import { Routes } from '@angular/router';
import { ClubFormComponent } from './club-form/club-form.component';
import { TimeRegistrationComponent } from './time-registration/time-registration.component';
import { VolunteerComponent } from './volunteer/volunteer.component';


export const routes: Routes = [
    {
        path: ':link',
        component: ClubFormComponent
    },
    {
        path: '',
        component: TimeRegistrationComponent
    },
    { 
        path: 'volunteers/:id',
         component: VolunteerComponent 
    }
];
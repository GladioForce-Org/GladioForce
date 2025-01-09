import { Routes } from '@angular/router';
import { ClubFormComponent } from './club-form/club-form.component';
import { TimeRegistrationComponent } from './time-registration/time-registration.component';
import { VolunteerComponent } from './volunteer/volunteer.component';
import { VolunteersComponent } from './volunteers/volunteers.component';


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
         component: VolunteersComponent 
    },
    { 
        path: 'volunteer/:id',
         component: VolunteerComponent 
    },
    {
        path: '',
        redirectTo: '/home', pathMatch: 'full'
    }
];
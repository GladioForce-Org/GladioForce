import { Routes } from '@angular/router';
import { ClubRegistrationComponent } from './club-registration/club-registration.component';
import { ClubInfoFormComponent } from './club-info-form/club-info-form.component';
import { TimeRegistrationComponent } from './time-registration/time-registration.component';
import { VolunteerComponent } from './volunteer/volunteer.component';
import { VolunteersComponent } from './volunteers/volunteers.component';


export const routes: Routes = [
    {
        path: ':link',
        component: ClubRegistrationComponent
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
        path: 'volunteer/:clubid/:id',
        component: VolunteerComponent 
    },
    {
        path: '',
        redirectTo: '/home', pathMatch: 'full'
    }
];
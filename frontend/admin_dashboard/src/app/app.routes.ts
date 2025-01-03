import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ContainersComponent } from './containers/containers.component';
import { TshirtsComponent } from './tshirts/tshirts.component';
import { CoremembersComponent } from './coremembers/coremembers.component';
import { ClubsComponent } from './clubs/clubs.component';
import { TasksComponent } from './tasks/tasks.component';
import { PlanningComponent } from './planning/planning.component';
import { ExportComponent } from './export/export.component';
import { DocumentsComponent } from './documents/documents.component';
import { HelpComponent } from './info/info.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthComponent } from './auth/auth.component';
import { EditionComponent } from './edition/edition.component';

export const routes: Routes = [
    {path: 'home', component: HomeComponent},
    {path: 'containers', component: ContainersComponent},
    {path: 't-shirts', component: TshirtsComponent},
    {path: 'core-members', component: CoremembersComponent},
    {path: 'clubs', component: ClubsComponent},
    {path: 'tasks', component: TasksComponent},
    {path: 'planning', component: PlanningComponent},
    {path: 'export', component: ExportComponent},
    {path: 'documents', component: DocumentsComponent},
    {path: 'help', component: HelpComponent},
    {path: 'settings', component: SettingsComponent},
    {path: 'auth', component: AuthComponent},
    {path: 'editions', component: EditionComponent},
    { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route
];

import { Routes } from '@angular/router';
import { AppInstallerComponent } from './app-installer/app-installer.component';
import { AppFiscalityComponent } from './app-fiscality/app-fiscality.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'fiscality'
    },
    {
        path: 'fiscality',
        component: AppFiscalityComponent
    },
    {
        path: 'installer',
        component: AppInstallerComponent
    },

];

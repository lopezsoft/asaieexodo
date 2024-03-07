import { Routes } from "@angular/router";
export const content: Routes = [
    {
        path: 'voting',
        loadChildren: () => import('../../components/voting/voting-routing.module').then(m => m.VotingRoutingModule),
        data: {
            title: "Vote",
            breadcrumb: "Vote",
        }
    },
]
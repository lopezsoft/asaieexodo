import {AcademicNotesComponent} from "./academic-notes/academic-notes.component";
import {AcademicReportsComponent} from "./academic-reports/academic-reports.component";
import {AcademicActivitiesComponent} from "./academic-activities/academic-activities.component";
import {SchoolElectionsComponent} from "./school-elections/school-elections.component";

export const studentRoutes = {
  path: '',
  children: [
    {
      path: 'academic-notes',
      component: AcademicNotesComponent
    },
    {
      path: 'academic-reports',
      component: AcademicReportsComponent
    },
    {
      path: 'academic-activities',
      component: AcademicActivitiesComponent
    },
    {
      path: 'school-elections',
      component: SchoolElectionsComponent
    }
  ]
};

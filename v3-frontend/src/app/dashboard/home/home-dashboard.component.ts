import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  effect,
  Inject,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexXAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { finalize } from 'rxjs';
import { LoadMaskService } from '../../services/common/load-mask.service';
import { MessagesService } from '../../services/messages.service';
import {
  DashboardStatisticsResponse,
  V3AdministrationService,
  YearlyTotalPoint,
} from '../../services/v3-administration.service';
import { V3CatalogsService } from '../../services/v3-catalogs.service';
import {
  COMMUNITY_ROLE_LABELS,
  CommunityRole,
  resolveLandingRouteByRole,
  UnifiedSchoolMembership,
  V3UnifiedAuthService,
} from '../../services/v3-unified-auth.service';
import { SHARED_IMPORTS } from '../../shared/shared-imports';

interface BarChartConfig {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  colors: string[];
}

const ADMIN_DASHBOARD_ROLES: readonly CommunityRole[] = [
  'SUPER_ADMIN',
  'SCHOOL_ADMIN',
  'RECTOR',
  'COORDINATOR',
  'SECRETARY',
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NgApexchartsModule, ...SHARED_IMPORTS],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.scss',
})
export class HomeDashboardComponent implements OnInit {
  protected readonly v3Auth = inject(V3UnifiedAuthService);
  private readonly adminService = inject(V3AdministrationService);
  private readonly catalogsService = inject(V3CatalogsService);
  private readonly maskService = inject(LoadMaskService);
  private readonly messagesService = inject(MessagesService);
  private readonly router = inject(Router);

  protected readonly isBrowser: boolean;
  protected readonly loadingStats = signal(false);
  protected readonly statistics = signal<DashboardStatisticsResponse | null>(null);

  protected readonly canViewExecutiveDashboard = computed(() => {
    const role = this.v3Auth.activeRole();
    return Boolean(role && ADMIN_DASHBOARD_ROLES.includes(role));
  });

  protected readonly registeredChart = computed(() =>
    this.buildYearlyBarChart(
      'Matriculados',
      this.statistics()?.series.registeredByYear ?? [],
      '#053f74',
    ),
  );

  protected readonly retiredChart = computed(() =>
    this.buildYearlyBarChart(
      'Retirados',
      this.statistics()?.series.retiredByYear ?? [],
      '#FF4023',
    ),
  );

  protected readonly teachersChart = computed(() =>
    this.buildYearlyBarChart(
      'Docentes',
      this.statistics()?.series.teachersByYear ?? [],
      '#0399de',
    ),
  );

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Recarga reactivamente el Dashboard cuando cambia el año lectivo, el colegio o el rol
    effect(() => {
      const authenticated = this.v3Auth.isAuthenticated();
      const year = this.v3Auth.academicYear();
      const schoolId = this.v3Auth.activeSchoolId();
      const canView = this.canViewExecutiveDashboard();

      if (authenticated && schoolId && canView) {
        this.loadDashboardStatistics(year);
      } else {
        this.statistics.set(null);
      }
    });
  }

  ngOnInit(): void {
    if (this.v3Auth.isAuthenticated()) {
      this.v3Auth.fetchAuthenticatedProfile().subscribe();
    }
  }

  loadDashboardStatistics(academicYear: number): void {
    this.loadingStats.set(true);
    this.adminService
      .getDashboardStatistics(academicYear)
      .pipe(finalize(() => this.loadingStats.set(false)))
      .subscribe({
        next: (data) => this.statistics.set(data),
        error: () => this.statistics.set(null),
      });
  }

  getRoleLabel(role: CommunityRole): string {
    return COMMUNITY_ROLE_LABELS[role] ?? role;
  }

  isActiveContext(membership: UnifiedSchoolMembership): boolean {
    return (
      this.v3Auth.activeSchoolId() === membership.schoolId &&
      this.v3Auth.activeRole() === membership.role
    );
  }

  selectSchoolContext(membership: UnifiedSchoolMembership): void {
    if (this.isActiveContext(membership)) {
      return;
    }

    this.maskService.show('messages.loadingModule');
    this.v3Auth
      .switchSchoolAndRole(
        membership.schoolId,
        membership.role,
        this.v3Auth.academicYear(),
      )
      .pipe(finalize(() => this.maskService.hide()))
      .subscribe({
        next: (response) => {
          this.catalogsService.invalidateCache();
          this.messagesService.showSuccess(
            `Contexto actualizado: ${response.data.activeSchoolName} (${this.getRoleLabel(response.data.activeRole)})`,
          );
          const targetRoute = resolveLandingRouteByRole(response.data.activeRole);
          if (targetRoute !== '/dashboard') {
            void this.router.navigate([targetRoute]);
          }
        },
      });
  }

  private buildYearlyBarChart(
    seriesName: string,
    points: YearlyTotalPoint[],
    color: string,
  ): BarChartConfig {
    return {
      series: [
        {
          name: seriesName,
          data: points.map((p) => p.total),
        },
      ],
      chart: {
        type: 'bar',
        height: 240,
        toolbar: { show: true },
        fontFamily: 'Inter, sans-serif',
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '48%',
        },
      },
      dataLabels: { enabled: true },
      colors: [color],
      xaxis: {
        categories: points.map((p) => String(p.year)),
      },
    };
  }
}

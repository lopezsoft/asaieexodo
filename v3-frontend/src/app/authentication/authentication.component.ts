import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { filter } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomizerSettingsService } from '../customizer-settings/customizer-settings.service';
import { LanguageService } from '../services/common/language.service';
import { CustomTooltipDirective } from '../shared/directives/custom-tooltip.directive';

interface HeroSlideMetric {
  readonly value: string;
  readonly label: string;
}

interface HeroCarouselSlide {
  readonly id: string;
  readonly icon: string;
  readonly badge: string;
  readonly title: string;
  readonly description: string;
  readonly metrics: readonly [HeroSlideMetric, HeroSlideMetric, HeroSlideMetric];
}

const HERO_SLIDES_ES: readonly HeroCarouselSlide[] = [
  {
    id: 'academic-siee',
    icon: 'school',
    badge: 'Gestión Académica Integral',
    title: 'Control académico, planillas docentes y SIEE en tiempo real',
    description:
      'Centraliza evaluaciones, logros, nivelaciones, promoción anticipada y generación de boletines e informes oficiales desde un único portal.',
    metrics: [
      { value: '100%', label: 'Planillas y Logros' },
      { value: 'SIEE', label: 'Escalas y Promoción' },
      { value: 'PDF', label: 'Boletines y Actas' },
    ],
  },
  {
    id: 'community-portal',
    icon: 'hub',
    badge: 'Ecosistema Conectado',
    title: 'Toda la comunidad educativa articulada en un solo lugar',
    description:
      'Directivos, docentes, secretaría, estudiantes y acudientes operan con experiencias dedicadas, cambio ágil de sede y aulas virtuales.',
    metrics: [
      { value: '9 Roles', label: 'Acceso Unificado' },
      { value: 'Multi-Sede', label: 'Jornadas y Grados' },
      { value: 'LMS', label: 'Aula Virtual Activa' },
    ],
  },
  {
    id: 'security-onboarding',
    icon: 'verified_user',
    badge: 'Arquitectura Cloud Segura',
    title: 'Aislamiento institucional estricto y arranque en minutos',
    description:
      'Registra tu Institución Educativa en línea con sede principal, año lectivo, jornadas base, niveles MEN y 30 días de prueba sin fricciones.',
    metrics: [
      { value: 'RLS', label: 'Datos Aislados por IE' },
      { value: '30 Días', label: 'Prueba Gratuita IE' },
      { value: 'Voto', label: 'Gobierno Escolar' },
    ],
  },
];

const HERO_SLIDES_EN: readonly HeroCarouselSlide[] = [
  {
    id: 'academic-siee',
    icon: 'school',
    badge: 'Academic Excellence',
    title: 'Academic grading, teacher gradebooks, and SIEE in real time',
    description:
      'Streamline evaluations, learning descriptors, recovery plans, promotion workflows, and official PDF report cards in one cloud platform.',
    metrics: [
      { value: '100%', label: 'Gradebooks & Plans' },
      { value: 'SIEE', label: 'Scales & Promotion' },
      { value: 'PDF', label: 'Reports & Transcripts' },
    ],
  },
  {
    id: 'community-portal',
    icon: 'hub',
    badge: 'Connected Community',
    title: 'Your entire educational community unified seamlessly',
    description:
      'Principals, coordinators, teachers, students, and families collaborate with role-tailored dashboards, multi-campus switching, and virtual classrooms.',
    metrics: [
      { value: '9 Roles', label: 'Unified Access' },
      { value: 'Campuses', label: 'Shifts & Grades' },
      { value: 'LMS', label: 'Virtual Classroom' },
    ],
  },
  {
    id: 'security-onboarding',
    icon: 'verified_user',
    badge: 'Enterprise Cloud Security',
    title: 'Strict school data isolation and instant cloud onboarding',
    description:
      'Launch a new Educational Institution with main campus, academic year, base shifts, education levels, and a 30-day free trial in minutes.',
    metrics: [
      { value: 'RLS', label: 'Isolated Tenant Data' },
      { value: '30 Days', label: 'Free School Trial' },
      { value: 'Vote', label: 'School Elections' },
    ],
  },
];

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    TranslocoModule,
    CustomTooltipDirective,
  ],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
})
export class AuthenticationComponent implements OnInit {
  protected readonly themeService = inject(CustomizerSettingsService);
  protected readonly languageService = inject(LanguageService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isBrowser = isPlatformBrowser(this.platformId);
  protected readonly activeSlideIndex = signal(0);
  protected readonly isCarouselPaused = signal(false);
  protected readonly currentUrl = signal(this.router.url);
  protected readonly parallaxX = signal(0);
  protected readonly parallaxY = signal(0);

  protected readonly appVersion = environment.VERSION;
  protected readonly currentYear = new Date().getFullYear();

  protected readonly slides = computed(() =>
    this.languageService.activeLang() === 'en' ? HERO_SLIDES_EN : HERO_SLIDES_ES,
  );

  protected readonly activeSlide = computed(() => {
    const list = this.slides();
    return list[this.activeSlideIndex() % list.length] ?? list[0];
  });

  protected readonly isSignInRoute = computed(() => {
    const cleanPath = this.currentUrl().split('?')[0].replace(/\/+$/, '');
    return cleanPath === '/auth' || cleanPath === '';
  });

  protected readonly isSignUpRoute = computed(() => {
    const cleanPath = this.currentUrl().split('?')[0].replace(/\/+$/, '');
    return cleanPath === '/auth/sign-up';
  });

  protected readonly showAuthModeTabs = computed(
    () => this.isSignInRoute() || this.isSignUpRoute(),
  );

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    const timerId = window.setInterval(() => {
      if (!this.isCarouselPaused()) {
        this.nextSlide();
      }
    }, 6500);

    this.destroyRef.onDestroy(() => {
      window.clearInterval(timerId);
    });
  }

  protected selectSlide(index: number): void {
    const total = this.slides().length;
    this.activeSlideIndex.set(((index % total) + total) % total);
  }

  protected nextSlide(): void {
    this.selectSlide(this.activeSlideIndex() + 1);
  }

  protected prevSlide(): void {
    this.selectSlide(this.activeSlideIndex() - 1);
  }

  protected setCarouselPaused(paused: boolean): void {
    this.isCarouselPaused.set(paused);
  }

  protected toggleLanguage(): void {
    const nextLang = this.languageService.activeLang() === 'es' ? 'en' : 'es';
    this.languageService.changeLanguage(nextLang);
  }

  protected onHeroPointerMove(event: PointerEvent): void {
    if (!this.isBrowser) {
      return;
    }
    const target = event.currentTarget as HTMLElement | null;
    if (!target) {
      return;
    }
    const rect = target.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }
    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
    this.parallaxX.set(Number(normalizedX.toFixed(3)));
    this.parallaxY.set(Number(normalizedY.toFixed(3)));
  }

  protected onHeroPointerLeave(): void {
    this.parallaxX.set(0);
    this.parallaxY.set(0);
  }
}

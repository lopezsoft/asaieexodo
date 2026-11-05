import {Component, HostListener, inject, Inject, PLATFORM_ID} from '@angular/core';
import { RouterLink, NavigationEnd, Router } from '@angular/router';
import {NgClass, NgIf, isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './navbar/navbar.component';
import {TranslocoPipe} from "@jsverse/transloco";
import { ToggleService } from './toggle.service';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import {LanguageService} from "../../services/common/language.service";
import {UserActionsService} from "../../services/common/user-actions.service";
import {AuthService} from "../../services/auth.service";
import {fallbackAvatarUrl} from "../../utils/utils";

@Component({
    selector: 'app-header',
  imports: [RouterLink, NgClass, NgIf, NavbarComponent, TranslocoPipe, NgOptimizedImage],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    public langService = inject(LanguageService);
    public uActionsService = inject(UserActionsService);
    public authService = inject(AuthService);
    // isSidebarToggled
    isSidebarToggled = false;

    // isToggled
    isToggled = false;

    protected fallbackAvatarUrl = fallbackAvatarUrl();

    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        @Inject(PLATFORM_ID) private platformId: Object,
        private router: Router
    ) {
        this.toggleService.isSidebarToggled$.subscribe(isSidebarToggled => {
            this.isSidebarToggled = isSidebarToggled;
        });
        this.themeService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
        // Subscribe to router events to toggle the sidebar on navigation
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            // Check if the sidebar is currently toggled and if so, toggle it
            if (this.isSidebarToggled) {
                this.toggleService.toggle(); // Close the sidebar if it's open
            }
        });
    }

    // Burger Menu Toggle
    toggle() {
        this.toggleService.toggle();
    }

    // Dark Mode
    toggleTheme() {
        this.themeService.toggleTheme();
    }

    // Header Sticky
    isSticky: boolean = false;
    @HostListener('window:scroll', ['$event'])
    checkScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
        this.isSticky = scrollPosition >= 50;
    }

    // Dropdown Menu
    isConnectedAppsDropdownOpen = false;
    isLanguageDropdownOpen = false;
    isNotificationsDropdownOpen = false;
    isProfileDropdownOpen = false;
    toggleLanguageDropdown() {
        this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    }
    toggleProfileDropdown() {
        this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.connected-apps-menu')) {
            this.isConnectedAppsDropdownOpen = false;
        }
        if (!target.closest('.language-menu')) {
            this.isLanguageDropdownOpen = false;
        }
        if (!target.closest('.notifications-menu')) {
            this.isNotificationsDropdownOpen = false;
        }
        if (!target.closest('.profile-menu')) {
            this.isProfileDropdownOpen = false;
        }
    }

    // Fullscreen
    isFullscreen: boolean = false;
    toggleFullscreen() {
        if (this.isFullscreen) {
            this.closeFullscreen();
        } else {
            this.openFullscreen();
        }
    }
    openFullscreen() {
        if (isPlatformBrowser(this.platformId)) {
            const element = document.documentElement as HTMLElement & {
                mozRequestFullScreen?: () => Promise<void>;
                webkitRequestFullscreen?: () => Promise<void>;
                msRequestFullscreen?: () => Promise<void>;
            };
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) { // Firefox
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) { // Chrome, Safari, and Opera
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) { // IE/Edge
                element.msRequestFullscreen();
            }
        }
    }
    closeFullscreen() {
        if (isPlatformBrowser(this.platformId)) {
            const doc = document as Document & {
                mozCancelFullScreen?: () => Promise<void>;
                webkitExitFullscreen?: () => Promise<void>;
                msExitFullscreen?: () => Promise<void>;
            };
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (doc.mozCancelFullScreen) { // Firefox
                doc.mozCancelFullScreen();
            } else if (doc.webkitExitFullscreen) { // Chrome, Safari, and Opera
                doc.webkitExitFullscreen();
            } else if (doc.msExitFullscreen) { // IE/Edge
                doc.msExitFullscreen();
            }
        }
    }
    onFullscreenChange() {
        if (isPlatformBrowser(this.platformId)) {
            const doc = document as Document & {
                webkitFullscreenElement?: Element;
                mozFullScreenElement?: Element;
                msFullscreenElement?: Element;
            };
            this.isFullscreen = !!(document.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
        }
    }

  changeLanguage(en: string) {
    this.langService.changeLanguage(en);
  }

  getCurrentUserAvatar() {
    const user = this.uActionsService.getCurrentUser();
    return user.avatar ? user.avatar : 'assets/images/avatars/unknown.png'; // Default avatar if none is set
  }

  logout() {

  }
}

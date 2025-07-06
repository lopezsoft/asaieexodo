import { Component, HostListener } from '@angular/core';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-history-of-bids',
    imports: [NgIf],
    templateUrl: './history-of-bids.component.html',
    styleUrl: './history-of-bids.component.scss'
})
export class HistoryOfBidsComponent {

    constructor(
        public themeService: CustomizerSettingsService
    ) {}
    
    // Card Header Menu
    isCardHeaderOpen = false;
    toggleCardHeaderMenu() {
        this.isCardHeaderOpen = !this.isCardHeaderOpen;
    }
    @HostListener('document:click', ['$event'])
    handleClickOutside(event: Event) {
        const target = event.target as HTMLElement;
        if (!target.closest('.trezo-card-header-menu')) {
            this.isCardHeaderOpen = false;
        }
    }

}
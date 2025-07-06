import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { ReviewsComponent } from './reviews/reviews.component';
import { CustomizerSettingsService } from '../../../customizer-settings/customizer-settings.service';

@Component({
    selector: 'app-reap-property-details',
    imports: [RouterLink, CarouselModule, NgFor, ReviewsComponent],
    templateUrl: './reap-property-details.component.html',
    styleUrl: './reap-property-details.component.scss'
})
export class ReapPropertyDetailsComponent {
    
    // Product Images
    roomImages = [
        {
            url: 'images/rooms/room-details1.jpg'
        },
        {
            url: 'images/rooms/room-details2.jpg'
        },
        {
            url: 'images/rooms/room-details3.jpg'
        },
        {
            url: 'images/rooms/room-details4.jpg'
        }
    ]
    selectedImage: string = this.roomImages[0].url;
    changeImage(image: string) {
        this.selectedImage = image;
    }

    constructor(
        public themeService: CustomizerSettingsService
    ) {}

}
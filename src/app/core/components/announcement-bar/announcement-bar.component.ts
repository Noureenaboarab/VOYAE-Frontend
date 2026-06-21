import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'voy-announcement-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-bar.component.html',
  styleUrl: './announcement-bar.component.scss',
})
export class AnnouncementBarComponent {
  @Input() message = 'Complimentary Shipping & 100-Day Returns Worldwide';
}

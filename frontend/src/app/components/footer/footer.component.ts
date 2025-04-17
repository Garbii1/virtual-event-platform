// src/app/components/footer/footer.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Good practice to include if you might add *ngIf etc later

@Component({
  selector: 'app-footer',
  standalone: true, // Mark as standalone
  imports: [ CommonModule ], // Import CommonModule (optional for current template, but safe)
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  currentYear: number;

  constructor() {
    this.currentYear = new Date().getFullYear();
  }

  ngOnInit(): void {
  }
}
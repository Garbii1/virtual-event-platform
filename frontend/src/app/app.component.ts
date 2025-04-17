// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // For router-outlet
import { NavbarComponent } from './components/navbar/navbar.component'; // Import Navbar
import { FooterComponent } from './components/footer/footer.component'; // Import Footer

@Component({
  selector: 'app-root',
  standalone: true, // MAKE APPCOMPONENT STANDALONE
  imports: [RouterModule, NavbarComponent, FooterComponent], // IMPORT USED COMPONENTS/MODULES
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'frontend';
}
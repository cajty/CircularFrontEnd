import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SidebarComponent} from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-auth',
  imports: [
    RouterOutlet,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

}

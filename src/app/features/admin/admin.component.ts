import { Component } from '@angular/core';
import {SidebarComponent} from '../../shared/components/sidebar/sidebar.component';
import {RouterOutlet} from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [
    SidebarComponent,
    RouterOutlet
  ],
  templateUrl: './admin.component.html',
})
export class AdminComponent {

}

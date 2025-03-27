import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {SidebarComponent} from '../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-manager',
  imports: [
    SidebarComponent,
    RouterOutlet
  ],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.css'
})
export class ManagerComponent {

}

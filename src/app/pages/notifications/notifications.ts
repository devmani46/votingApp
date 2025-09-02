import { Component } from '@angular/core';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [BurgerMenu],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications {

}

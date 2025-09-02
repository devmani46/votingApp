import { Component } from '@angular/core';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [BurgerMenu],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {

}

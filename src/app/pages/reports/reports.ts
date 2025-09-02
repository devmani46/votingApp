import { Component } from '@angular/core';
import { BurgerMenu } from '../../components/burger-menu/burger-menu';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [BurgerMenu],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class Reports {

}

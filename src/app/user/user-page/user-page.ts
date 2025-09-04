import { Component } from '@angular/core';
import { NavBar } from '../../components/nav-bar/nav-bar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [NavBar, Footer],
  templateUrl: './user-page.html',
  styleUrls: ['./user-page.scss'],
})
export class UserPage {}

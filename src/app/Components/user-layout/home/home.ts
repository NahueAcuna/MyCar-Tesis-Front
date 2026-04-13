import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Browser } from '../browser/browser';

@Component({
  selector: 'app-home',
  imports: [Header,Browser],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}

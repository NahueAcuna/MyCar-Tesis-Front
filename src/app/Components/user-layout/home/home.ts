import { Component } from '@angular/core';
import { Header } from '../header/header';
import { Browser } from '../browser/browser';
import { Inventory } from '../inventory/inventory';
import { Footer } from '../../footer/footer';

@Component({
  selector: 'app-home',
  imports: [Header,Browser,Inventory, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}

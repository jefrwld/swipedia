import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {CommonModule} from '@angular/common';
import {WikiMainComponent} from './wiki-main/wiki-main.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WikiMainComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'wikiapp';
}

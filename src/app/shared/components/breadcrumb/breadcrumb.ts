import {Component, input} from '@angular/core';

export interface breadcrumb_item {
  label: string;
  active?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  imports: [],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css',
})
export class Breadcrumb {
  // items del breadcrumb
  items = input<breadcrumb_item[]>([]);
}

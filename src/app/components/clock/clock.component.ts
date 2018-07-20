import { Component, OnInit} from '@angular/core';
import { timer } from 'rxjs';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.scss']
})
export class ClockComponent implements OnInit {
  source = timer(0, 1000);
  clock: Date;

  constructor() { }

  ngOnInit() {
    const subscribe = this.source.subscribe(val => this.clock = new Date());
  }

}

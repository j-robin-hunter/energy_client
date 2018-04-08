import { Component, OnInit} from '@angular/core';
import { timer } from 'rxjs/observable/timer';

@Component({
  selector: 'app-clock',
  templateUrl: './clock.component.html',
  styleUrls: ['./clock.component.css']
})
export class ClockComponent implements OnInit {
  source = timer(1000, 2000);
  clock: Date;

  constructor() { }

  ngOnInit() {
    const subscribe = this.source.subscribe(val => this.clock = new Date());
  }

}

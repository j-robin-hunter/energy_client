import { Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser'
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  transitionendSubject: Subject<Window>;

  get onTransitionend$(): Observable<Window> {
    return this.transitionendSubject.asObservable();
  }


  constructor(private eventManager: EventManager) {
    this.transitionendSubject = new Subject();
    this.eventManager.addGlobalEventListener('window', 'transitionend', this.onTransitionend.bind(this));
  }

  onTransitionend(event: UIEvent) {
    this.transitionendSubject.next(<Window>event.target);
  }
}

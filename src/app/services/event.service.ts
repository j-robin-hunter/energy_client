import { Injectable } from '@angular/core';
import { EventManager } from '@angular/platform-browser'
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private transitionendSubject: Subject<Window>;
  private resizeSubject: Subject<Window>;
  private pageshowSubject: Subject<Window>;

  get onTransitionend$(): Observable<Window> {
    return this.transitionendSubject.asObservable();
  }

  get onResize$(): Observable<Window> {
    return this.resizeSubject.asObservable();
  }

  get onPageshow$(): Observable<Window> {
    return this.pageshowSubject.asObservable();
  }

  constructor(private eventManager: EventManager) {
    this.transitionendSubject = new Subject();
    this.resizeSubject = new Subject();
    this.pageshowSubject = new Subject();

    this.eventManager.addGlobalEventListener('window', 'transitionend', this.onTransitionend.bind(this));
    this.eventManager.addGlobalEventListener('window', 'resize', this.onResize.bind(this));
    this.eventManager.addGlobalEventListener('window', 'pageshow', this.onPageshow.bind(this));
  }

  onTransitionend(event: UIEvent) {
    this.transitionendSubject.next(<Window>event.target);
  }

  onResize(event: UIEvent) {
    this.resizeSubject.next(<Window>event.target);
  }

  onPageshow(event: UIEvent) {
    this.pageshowSubject.next(<Window>event.target);
  }
}

import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent implements OnInit {
  private onToastMessageSubscription: Subscription;
  constructor(private toastService: ToastService) {
  }

  ngOnInit() {
    this.onToastMessageSubscription = this.toastService.onToastMessage$.pipe().subscribe(message => {
      console.log(message);
    });
  }

  ngOnDestroy() {
    if (this.onToastMessageSubscription) {
       this.onToastMessageSubscription.unsubscribe();
     }
  }
}

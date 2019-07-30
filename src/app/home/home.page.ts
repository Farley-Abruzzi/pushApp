import { Component, OnInit, ApplicationRef } from '@angular/core';
import { PushService } from '../services/push.service';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  mensagens: OSNotificationPayload[] = []; 

  constructor( public pushService: PushService, private applicationRef: ApplicationRef ) {}

  ngOnInit() {
    this.pushService.pushListener.subscribe( noti => {
      this.mensagens.unshift( noti );
      this.applicationRef.tick();
    });
  }

  async ionViewWillEnter() {

    console.log('Will Enter - Carregar mensagens');
    this.mensagens = await this.pushService.getMensagens();
  }

  async apagarMensagens() {
    await this.pushService.apagarMensagens();
    this.mensagens = [];

    console.log(this.mensagens);
  }
}

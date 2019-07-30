import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensagens: OSNotificationPayload[] = [
    // {
    //   title: 'Titulo da push',
    //   body: 'Este é o body da push',
    //   date: new Date()
    // }
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor( private oneSignal: OneSignal, private storage: Storage ) {

    this.carregarMensagens();
   }

   async getMensagens() {
     await this.carregarMensagens();
     return [...this.mensagens];
   }

  configuracaoInicial() {

    this.oneSignal.startInit('8833d756-091e-4b99-8bab-5886c6b1bf35', '268507279650');

    this.oneSignal.inFocusDisplaying( this.oneSignal.OSInFocusDisplayOption.Notification );

    this.oneSignal.handleNotificationReceived().subscribe(( noti ) => {
     // do something when notification is received
     console.log('Notificação recebida.', noti);
     this.notificacaoRecebida( noti );
    });

    this.oneSignal.handleNotificationOpened().subscribe( async( noti ) => {
      // do something when a notification is opened
      console.log('Notificação aberta.', noti);
      await this.notificacaoRecebida( noti.notification );
    });

    // Obter ID de suscriptor
    this.oneSignal.getIds().then( info => {
      this.userId = info.userId;
      console.log(this.userId);
    });

    this.oneSignal.endInit();
    }

    async notificacaoRecebida( noti: OSNotification ) {
      
      await this.carregarMensagens();

      const payload = noti.payload;

      const existePush = this.mensagens.find( mensage => mensage.notificationID === payload.notificationID );

      if ( existePush ) {
        return;
      }

      this.mensagens.unshift( payload );
      this.pushListener.emit( payload );

      await this.guardarMensagens();
    }

    guardarMensagens() {
      this.storage.set('mensagens', this.mensagens );
    }

    async carregarMensagens() {
      this.mensagens = await this.storage.get('mensagens') || [];

      return this.mensagens;
    }

    async apagarMensagens() {
      await this.storage.clear();
      this.mensagens = [];
      this.guardarMensagens();
    }
}

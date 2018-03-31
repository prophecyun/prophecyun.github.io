import { Injectable } from '@angular/core';
import { Message } from '@stomp/stompjs';
import { StompConfig, StompRService } from '@stomp/ng2-stompjs';
import { WebConfig } from '../../config/web.config';
import 'rxjs/add/operator/map';

/**
 * Handles web socket connection to the server.
 */
@Injectable()
export class SocketWebService {

  constructor(private stompService: StompRService) {
  }

  init() {
    this.initSocket();
    // this.subscribeAll();
  }

  /**
   * Initializes connection to STOMP web socket.
   */
  private initSocket() {
    // Web socket configuration
    const stompConfig: StompConfig = {
      url: 'ws://' + WebConfig.SERVER_URL + '/subscribe/websocket',
      headers: {},
      heartbeat_in: 0, // Disabled
      heartbeat_out: 20000, // Every 20 seconds
      reconnect_delay: 5000, // Wait 5 seconds before attempting auto reconnect
      debug: false, // Log diagnostics on console
    };
    this.stompService.config = stompConfig;
    this.stompService.initAndConnect();
  }

  /**
   * Subscribe to all required message queues.
   */
  private subscribeAll() {
    // this.subscribeQueue('/topic/BFT').subscribe((msgBody: string) =>
    //   this.bftService.updateBFT(JSON.parse(msgBody)),
    // );
    // TODO: Add future subscriptions here
  }

  /**
   * Subscribes to a single message queue.
   */
  public subscribeQueue(queueName: string) {
    const subscription = this.stompService.subscribe(queueName);
    return subscription.map((message: Message) => {
      return message.body;
    });
  }

}

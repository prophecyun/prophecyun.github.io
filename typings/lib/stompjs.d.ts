
/**
 * Typescript interface definitions for using
 * Jeff Mesnil's stomp.js Javascript STOMP client
 * under Typescript, for example with Angular 2.
 *
 * https://github.com/jmesnil/stomp-websocket
 *
 */
declare module Stomp {

	export interface Client {
		heartbeat: any;
		
		debug(...args: string[]): any;

		connect(...args: any[]): any;
		disconnect(disconnectCallback?: () => any, headers?: any): any;

		send(destination: string, headers?:any, body?: string): any;
		subscribe(destination: string, callback?: (message: Message) => any, body?: string): any;
		unsubscribe(): any;

		begin(transaction: string): any;
		commit(transaction: string): any;
		abort(transaction: string): any;

		ack(messageID: string, subscription: string, headers?: any): any;
		nack(messageID: string, subscription: string, headers?: any): any;
	}

	export interface Message {
		command: string;
		headers: any;
		body: string;

		ack(headers?: any): any;
		nack(headers?: any): any;
	}

	export interface Frame {
		constructor(command: string, headers?: any, body?: string): any;

		toString(): string;
		sizeOfUTF8(s: string): any;
		unmarshall(datas: any): any;
		marshall(command: string, headers?: any, body?: any): any;
	}

	function over(ws: WebSocket): any;

	export interface Stomp {
		client: Client;
		Frame: Frame;
	}

	export var Stomp: any;
}
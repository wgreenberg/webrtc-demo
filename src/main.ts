import { GameClient, PeerClient, startClient } from './client';
import { GameServer, PeerServer, startServer } from './server';
import { Message, MessageType } from './message';
import { User } from './user';

class MyClient implements GameClient {
  userMetadata: any;
  messageType = MessageType.Binary;
  peerClient: PeerClient | undefined;
  constructor(public serverId: string, public element: HTMLElement) {
  }
  public start(): void {
    this.log(`connecting to ${this.serverId}...`);
    startClient(this, this.serverId);
  }
  log(message: string): void {
    this.element.innerHTML += `> ${message}\n`;
  }
  onConnect(peerClient: PeerClient): void {
    this.log(`connected, user id is ${peerClient.id}`);
    this.peerClient = peerClient;
  }
  onDisconnect(): void {
    this.log(`disconnected from server`);
  }
  onMessage(message: Message): void {
    this.log(`got message from server: (${message.messageType}) ${message.data}`);
  }
}

class MyServer implements GameServer {
  peerServer: PeerServer | undefined;
  constructor(public element: HTMLElement) {
  }
  public start(): void {
    this.log(`server starting...`)
    startServer(this);
  }
  log(message: string): void {
    this.element.innerHTML += `> ${message}\n`;
  }
  onInit(peerServer: PeerServer): void {
    this.log(`server id is ${peerServer.id}`);
    this.peerServer = peerServer;
  }
  onConnect(user: User): void {
    this.log(`user ${user.id} connected`);
  }
  onDisconnect(user: User): void {
    this.log(`user ${user.id} disconnected`);
  }
  onMessage(user: User, message: Message): void {
    this.log(`user ${user.id}: (${message.messageType}) ${message.data}`);
  }
  onClose(): void {
    this.log(`server connection closed`);
  }
}

interface ClientElements {
  log: HTMLElement;
  serverIdInput: HTMLInputElement;
  startButton: HTMLButtonElement;
  sendTextInput: HTMLInputElement;
  sendTextButton: HTMLButtonElement;
}

function getClientElements(): ClientElements {
  return {
    log: document.querySelector('#client > pre')! as HTMLElement,
    serverIdInput: document.querySelector('#client > input')! as HTMLInputElement,
    startButton: document.querySelector('#client > button')! as HTMLButtonElement,
    sendTextInput: document.querySelector('#client > #send-controls > input')! as HTMLInputElement,
    sendTextButton: document.querySelector('#client > #send-controls > button')! as HTMLButtonElement
  };
}

interface ServerElements {
  log: HTMLElement;
  startButton: HTMLButtonElement;
  sendTextInput: HTMLInputElement;
  sendTextUserInput: HTMLInputElement;
  sendTextButton: HTMLButtonElement;
  broadcastTextInput: HTMLInputElement;
  broadcastTextButton: HTMLButtonElement
}

function getServerElements(): ServerElements {
  const [sendTextUserInput, sendTextInput] = document.querySelectorAll('#server > #send-controls > input')!;
  return {
    log: document.querySelector('#server > pre')! as HTMLElement,
    startButton: document.querySelector('#server > button')! as HTMLButtonElement,
    sendTextInput: sendTextInput as HTMLInputElement,
    sendTextUserInput: sendTextUserInput as HTMLInputElement,
    sendTextButton: document.querySelector('#server > #send-controls > button')! as HTMLButtonElement,
    broadcastTextInput: document.querySelector('#server > #broadcast-controls > input')! as HTMLInputElement,
    broadcastTextButton: document.querySelector('#server > #broadcast-controls > button')! as HTMLButtonElement
  };
}

window.addEventListener('load', () => {
  const clientElements = getClientElements();
  clientElements.startButton.addEventListener('click', () => {
    const client = new MyClient(clientElements.serverIdInput.value, clientElements.log);
    clientElements.sendTextButton.addEventListener('click', () => {
      const message = clientElements.sendTextInput.value;
      client.log(`Sending ${message}`);
      client.peerClient!.send(new Message(MessageType.Binary, message));
    });
    client.start();
  });

  const serverElements = getServerElements();
  serverElements.startButton.addEventListener('click', () => {
    const server = new MyServer(serverElements.log);
    serverElements.sendTextButton.addEventListener('click', () => {
      const message = serverElements.sendTextInput.value;
      const user = server.peerServer!.users.find((u) => u.id === serverElements.sendTextUserInput.value)!;
      server.log(`Sending to ${user.id}: ${message}`);
      server.peerServer!.send(user, new Message(MessageType.Binary, message));
    });
    serverElements.broadcastTextButton.addEventListener('click', () => {
      const message = serverElements.broadcastTextInput.value;
      server.log(`Broadcasting ${message}`);
      server.peerServer!.broadcast(new Message(MessageType.Binary, message));
    });
    server.start();
  });
});

import { User } from './user';
import { DataConnection, PeerJSOption } from 'peerjs';
import { connect } from './peer';
import { Message } from './message';

export class PeerServer {
    public users: User[] = [];
    public id: string | undefined;

    constructor(public gameServer: GameServer) {
    }

    async start(options?: PeerJSOption) {
        const [peer, id] = await connect(options);
        this.id = id;
        peer.on('connection', (dataConnection: DataConnection) => {
            const user = new User(dataConnection);
            this.users.push(user);
            this.gameServer.onConnect(user);
            dataConnection.on('data', (data: any) => {
                const message = new Message(user.messageType, data);
                this.gameServer.onMessage(user, message);
            });
            dataConnection.on('close', () => {
                this.users = this.users.filter((u) => u !== user);
                this.gameServer.onDisconnect(user);
            });
        });
        peer.on('close', () => {
            this.gameServer.onClose();
        });
        this.gameServer.onInit(this);
    }

    public broadcast(message: Message) {
        for (const user of this.users) {
            this.send(user, message);
        }
    }

    public send(user: User, message: Message) {
        if (message.messageType !== user.messageType) {
            throw new Error(`User ${user.id} expects messages of type ${user.messageType}, but got ${message.messageType}`);
        }
        user.dataConnection.send(message.data);
    }
}

export async function startServer(gameServer: GameServer, options?: PeerJSOption) {
    const peerServer = new PeerServer(gameServer);
    await peerServer.start(options);
}

export interface GameServer {
    onInit(peerServer: PeerServer): void;
    onConnect(user: User): void;
    onDisconnect(user: User): void;
    onMessage(user: User, message: Message): void;
    onClose(): void;
}

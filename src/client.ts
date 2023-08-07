import Peer, { DataConnection, PeerJSOption } from 'peerjs';
import { connect } from "./peer";
import { MessageType, Message, messageTypeToString } from "./message";

export class PeerClient {
    public dataConnection: DataConnection | undefined;
    public id: string | undefined;
    public peer: Peer | undefined;

    constructor(public gameClient: GameClient) {
    }

    async connect(serverId: string, options?: PeerJSOption) {
        const [peer, id] = await connect(options);
        this.peer = peer;
        this.id = id;
        const dataConnection = peer.connect(serverId, {
            metadata: this.gameClient.userMetadata,
            serialization: messageTypeToString(this.gameClient.messageType),
        });
        this.dataConnection = dataConnection;
        dataConnection.on('open', () => {
            this.gameClient.onConnect(this);
        });
        dataConnection.on('data', (data: any) => {
            const message = new Message(this.gameClient.messageType, data);
            this.gameClient.onMessage(message);
        });
        dataConnection.on('close', () => {
            this.gameClient.onDisconnect();
        });
    }

    public send(message: Message) {
        this.dataConnection?.send(message.data);
    }
}

export async function startClient(gameClient: GameClient, serverId: string, options?: PeerJSOption) {
    const peerClient = new PeerClient(gameClient);
    await peerClient.connect(serverId, options);
}

export interface GameClient {
    userMetadata: any;
    messageType: MessageType;
    onConnect(peerClient: PeerClient): void;
    onDisconnect(): void;
    onMessage(message: Message): void;
}

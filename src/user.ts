import { DataConnection } from "peerjs";
import { messageTypeFromString, MessageType } from "./message";

export class User {
    public id: string;
    public dataConnection: DataConnection;
    public messageType: MessageType;

    constructor(dataConnection: DataConnection) {
        this.dataConnection = dataConnection;
        this.messageType = messageTypeFromString(dataConnection.serialization);
        this.id = dataConnection.peer;
    }
}

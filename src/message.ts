export enum MessageType {
    Binary,
    BinaryUtf8,
    Json,
    None,
}

export function messageTypeToString(messageType: MessageType): string {
    switch (messageType) {
        case MessageType.Binary:
            return 'binary';
        case MessageType.BinaryUtf8:
            return 'binary-utf8';
        case MessageType.Json:
            return 'json';
        case MessageType.None:
            return 'none';
        default:
            throw new Error(`Unknown message type ${messageType}`);
    }
}

export function messageTypeFromString(serialization: string): MessageType {
    switch (serialization) {
        case 'binary':
            return MessageType.Binary;
        case 'binary-utf8':
            return MessageType.BinaryUtf8;
        case 'json':
            return MessageType.Json;
        case 'none':
            return MessageType.None;
        default:
            throw new Error(`Unknown serialization ${serialization}`);
    }
}

export class Message {
    constructor(public messageType: MessageType, public data: any) {
    }
}

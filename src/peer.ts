import Peer, { PeerJSOption } from 'peerjs';

export async function connect(options?: PeerJSOption) {
    let peer: Peer;
    if (options === undefined) {
        peer = new Peer();
    } else {
        peer = new Peer(options);
    }

    return new Promise<[Peer, string]>((resolve, reject) => {
        peer.on('open', (id) => {
            resolve([peer, id]);
        }).on('error', (error) => {
            reject(error);
        })
    });
}

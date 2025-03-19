const net = require('net');
const dgram = require('dgram');

// === Serveur TCP (pour le chat, les connexions, etc.) ===
const tcpServer = net.createServer((socket) => {
    console.log(`Un joueur s'est connecté: ${socket.remoteAddress}:${socket.remotePort}`);
    
    socket.write('Bienvenue sur le serveur multijoueur !\n');

    socket.on('data', (data) => {
        console.log(`Message reçu TCP: ${data.toString()}`);
        socket.write(`Reçu: ${data.toString()}`);
    });

    socket.on('end', () => console.log('Un joueur s\'est déconnecté.'));
    socket.on('error', (err) => console.error('Erreur TCP:', err.message));
});

// Écoute sur **toutes les interfaces réseau** de la VM (et pas seulement `127.0.0.1`)
tcpServer.listen(3000, '0.0.0.0', () => {
    console.log('Serveur TCP en écoute sur le port 3000');
});

// === Serveur UDP (pour le gameplay en temps réel) ===
const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg, rinfo) => {
    console.log(`Message reçu de ${rinfo.address}:${rinfo.port} -> ${msg.toString()}`);
    
    // Répondre au client UDP
    const response = Buffer.from(`Reçu: ${msg.toString()}`);
    udpServer.send(response, rinfo.port, rinfo.address, (err) => {
        if (err) console.error('Erreur envoi UDP:', err);
    });
});

udpServer.bind(4000, '0.0.0.0', () => {
    console.log('Serveur UDP en écoute sur le port 4000');
});

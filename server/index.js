const net = require('net');
const dgram = require('dgram');

let clients = [];
let gameState = {
    paddleLeft: { position: [0, 0] },
    paddleRight: { position: [580, 0] },
    ball: { position: [300, 200] }
};

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

tcpServer.listen(3000, '0.0.0.0', () => {
    console.log('Serveur TCP en écoute sur le port 3000');
});

// === Serveur UDP (pour le gameplay en temps réel) ===
const udpServer = dgram.createSocket('udp4');

udpServer.on('message', (msg, rinfo) => {
    try {
        const data = JSON.parse(msg.toString());
        const client = `${rinfo.address}:${rinfo.port}`;
        
        // Ajouter le client s'il n'est pas déjà présent
        if (!clients.includes(client)) {
            clients.push(client);
            console.log(`Nouveau client UDP: ${client}`);
        }
        
        // Mettre à jour l'état du jeu avec les données reçues
        if (data.paddleLeft) gameState.paddleLeft = data.paddleLeft;
        if (data.paddleRight) gameState.paddleRight = data.paddleRight;
        if (data.ball) gameState.ball = data.ball;
        
        // Diffuser l'état actuel du jeu à tous les clients
        broadcastGameState();
        
    } catch (error) {
        console.error('Erreur traitement message:', error);
    }
});

function broadcastGameState() {
    const stateString = JSON.stringify(gameState);
    
    clients.forEach(client => {
        const [clientAddress, clientPort] = client.split(':');
        udpServer.send(stateString, parseInt(clientPort), clientAddress, (err) => {
            if (err) {
                console.error(`Erreur envoi à ${client}:`, err);
                // Supprimer les clients qui ne sont plus disponibles
                clients = clients.filter(c => c !== client);
            }
        });
    });
}

udpServer.bind(4000, '0.0.0.0', () => {
    console.log('Serveur UDP en écoute sur le port 4000');
});
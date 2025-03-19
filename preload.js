const { contextBridge, ipcRenderer } = require('electron');
const net = require('net');
const dgram = require('dgram');

//// ========================== CONFIGURATION ========================== ////
const SERVER_IP = '192.168.34.165'; // IP de ta VM
const TCP_PORT = 3000; // Port TCP
const UDP_PORT = 4000; // Port UDP

//// ========================== CLIENT TCP ========================== ////
const tcpClient = new net.Socket();

function connectToTcpServer() {
    console.log(`Tentative de connexion au serveur TCP ${SERVER_IP}:${TCP_PORT}...`);

    tcpClient.connect(TCP_PORT, SERVER_IP, () => {
        console.log(`✅ Connecté au serveur TCP ${SERVER_IP}:${TCP_PORT}`);
        tcpClient.write('Hello depuis Electron TCP !');
    });

    tcpClient.on('data', (data) => {
        console.log(`📩 Message reçu du serveur TCP: ${data.toString()}`);
    });

    tcpClient.on('error', (err) => {
        console.error('❌ Erreur TCP:', err.message);
        setTimeout(connectToTcpServer, 5000); // Réessayer après 5 secondes si erreur
    });

    tcpClient.on('close', () => {
        console.warn('⚠️ Connexion TCP fermée. Reconnexion...');
        setTimeout(connectToTcpServer, 5000); // Reconnexion automatique après 5 secondes
    });
}

//// ========================== CLIENT UDP ========================== ////
const udpClient = dgram.createSocket('udp4');

function sendUdpMessage(message) {
    const buffer = Buffer.from(message);
    udpClient.send(buffer, UDP_PORT, SERVER_IP, (err) => {
        if (err) console.error('❌ Erreur envoi UDP:', err);
        else console.log(`📨 Message UDP envoyé: ${message}`);
    });
}

// Réception des messages UDP
udpClient.on('message', (msg, rinfo) => {
    console.log(`📩 Message UDP reçu de ${rinfo.address}:${rinfo.port}: ${msg.toString()}`);
});

// ========================== CONNEXION AUTOMATIQUE ========================== //
// Lancer la connexion TCP immédiatement
connectToTcpServer();

// Exposer TCP et UDP au renderer.js
contextBridge.exposeInMainWorld('network', {
    sendUdp: (message) => sendUdpMessage(message)
});

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});

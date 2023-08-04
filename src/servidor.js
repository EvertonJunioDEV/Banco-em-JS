const express = require('express');
const { senhaDoBanco} = require('./intermediarios/intermediario')
const {listarContas, criarUmaConta, modificandoConta, deletandoConta, depositandoConta,sacandoConta, transacaoConta, consultarSaldo, extrato } = require('./controladores/controlador')

const app = express();

app.use(express.json());


app.get('/contas', senhaDoBanco, listarContas);
app.post('/contas', criarUmaConta);
app.put('/contas/:numeroConta/usuario',modificandoConta)
app.delete('/contas/:numeroConta', deletandoConta)
app.post('/transacoes/depositar',depositandoConta)
app.post('/transacoes/sacar',sacandoConta)
app.post('/transacoes/transferir',transacaoConta)
app.get('/contas/saldo', consultarSaldo)
app.get('/contas/extrato', extrato)
module.exports = app;
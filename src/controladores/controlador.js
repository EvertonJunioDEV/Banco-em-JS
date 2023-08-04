let {banco, contas,saques,depositos,transferencias} = require('../bancodedados');
//     obj,  ....... raays
const format = require('date-fns/format')
let idConta = 1;

function dataFormatada(){
    return format(new Date(), "yyy-MM-dd H:mm:ss")
}


const listarContas = (req,res)=>{
    res.status(200).json(contas);
};

const criarUmaConta = (req,res)=>{

    const body = req.body;
    
    function campoVazio(algo){
        return res.status(400).json({'mensagem': `Campo ${algo} Não Preenchido`});
    }
    
    if (!body.nome.trim()){
        return campoVazio("nome");
    }
    if (!body.cpf.trim()){
        return campoVazio("cpf");
    }
    if (!body.data_nascimento.trim()){
        return campoVazio("data_nascimento");
    }
    if (!body.telefone.trim()){
        return campoVazio("telefone");
    }
    if (!body.email.trim()){
        return campoVazio("email");
    }
    if (!body.senha.trim()){
        return campoVazio("senha");
    }
        
    const cpfExistente = contas.find(achar => achar.usuario.cpf == body.cpf);
    
    const emailExistente = contas.find(achar => achar.usuario.email == body.email);

    if (cpfExistente && emailExistente){
        return res.status(409).json({"mensagem": "Já Existe Uma Conta Com O Cpf E Email Informados"});
    }

    if(cpfExistente){
        return res.status(409).json({"mensagem": "Já Existe Uma Conta Com O Cpf Informado"});
    }
    if(emailExistente){
        return res.status(409).json({"mensagem": "Já Existe Uma Conta Com O Email Informado"});
    }
    



    const contaAdd = {
        numero: idConta++,
        saldo: 0,
        usuario:{
            nome: body.nome,
            email: body.email,
            cpf: body.cpf,
            data_nascimento: body.data_nascimento,
            telefone: body.telefone,
            senha: body.senha
        }
    };

    contas.push(contaAdd);
    
    res.status(201).json(contaAdd);
};

const modificandoConta = (req,res)=>{
    const { numeroConta } = req.params;
    const body = req.body;

    if (Object.keys(body).length == 0) {
        return res.status(400).json({ mensagem: 'Nenhum dado para atualizar' });
    }
    
    const idExistente = contas.find(achar => achar.numero == Number(numeroConta));
    
    if (!idExistente){
        return res.status(400).json({'mensagem': `Numero De Conta Não Encontrado Ou Não Informado`});
    }
    
    if(!body){
        return res.status(400).json({'mensagem': `Nenhum Dado Informado`});
    }

    if(body.cpf && body.email){
        const cpfExistente = contas.find(achar => achar.usuario.cpf == body.cpf);
        const emailExistente = contas.find(achar => achar.usuario.email == body.email);
        
        if (cpfExistente && emailExistente){
            return res.status(409).json({"mensagem": "Já Existe Uma Conta Com O Cpf E Email Informados"});
        }
    }

    if(body.cpf){
        const cpfExistente = contas.find(achar => achar.usuario.cpf == body.cpf);
        if(cpfExistente){
            return res.status(409).json({"mensagem": "Já Existe Uma Conta Com O Cpf Informado"});
        }
    }

    if (body.email){
        const emailExistente = contas.find(achar => achar.usuario.email == body.email);
        if(emailExistente){
            return res.status(409).json({"mensagem": "Já Existe Uma Conta Com O Email Informado"});
        }
    }
    

    const conta = contas.find(encontrar => encontrar.numero == Number(numeroConta))

    if(body.nome){
        conta.usuario.nome = body.nome;
    } 
    if(body.email){
        conta.usuario.email = body.email;
    }
    if(body.cpf){
        conta.usuario.cpf = body.cpf;
    }
    if(body.data_nascimento){
        conta.usuario.data_nascimento = body.data_nascimento;
    }
    if(body.telefone){
        conta.usuario.telefone = body.telefone;
    }
    if(body.senha){
        conta.usuario.senha = body.senha;
    }
    
    return res.status(201).json({ 'mensagem': 'Conta atualizada com sucesso' });

};

const deletandoConta = (req,res)=>{
    const { numeroConta } = req.params;
    
    const idExistente = contas.find(achar => achar.numero == Number(numeroConta));
    
    if (!idExistente){
        return res.status(400).json({'mensagem': `Numero De Conta Não Encontrado Ou Não Informado`});
    } 

    if(idExistente.saldo !== 0){
        return res.status(403).json({'mensagem': 'Impossivel Excluir Conta Com Saldo Presente'})
    }
    
    contas.splice(contas.findIndex(achei => achei.numero == numeroConta),1);
    
    res.status(200).json({'mensagem': "Conta excluída com sucesso"})
};

const depositandoConta = (req,res)=>{
    const { numero_conta, valor } = req.body;
    const idExistente = contas.find(achar => achar.numero == Number(numero_conta));

    if(!idExistente){
        return res.status(404).json({'mensagem':'Conta Não Encontrada'});
    }

    if(valor <= 0){
        return res.status(401).json({'mensagem':'Depósito Mínimo De 1 Centavo'})
    }

    idExistente.saldo += valor;

    depositos.push({
        data: dataFormatada(),
        numero_conta,
        valor
    })

    return res.status(200).json({'mensagem': "Depósito realizado com sucesso"});

};

const sacandoConta = (req,res)=>{
    const { numero_conta, valor, senha } = req.body;
    const idExistente = contas.find(achar => achar.numero == Number(numero_conta));

    if(!idExistente){
        return res.status(404).json({'mensagem':'Conta Não Encontrada'});
    }

    if(senha != idExistente.usuario.senha){
        return res.status(403).json({'mensagem':'Senha Incorreta'});
    }

    if(valor > idExistente.saldo){
        return res.status(401).json({'mensagem':'Valor Acima Do Saldo'})
    }

    idExistente.saldo -= valor;

    saques.push({
        data: dataFormatada(),
        numero_conta,
        valor
    })

    return res.status(200).json({'mensagem': "Saque realizado com sucesso"});


}

const transacaoConta = (req,res)=>{
    const { numero_conta_origem, numero_conta_destino, valor,
senha } = req.body;

    const contaOrigem = contas.find(achar => achar.numero == Number(numero_conta_origem));
    const contaDestino = contas.find(achar => achar.numero == Number(numero_conta_destino));

    if(!contaOrigem){
        return res.status(404).json({'mensagem':'Conta Não Encontrada'});
    }

    if(!contaDestino){
        return res.status(404).json({'mensagem':'Conta Não Encontrada'});
    }

    if(senha != contaOrigem.usuario.senha){
        return res.status(403).json({'mensagem':'Senha Incorreta'});
    }

    if(valor > contaOrigem.saldo){
        return res.status(401).json({'mensagem':'Valor Acima Do Saldo'})
    }


    contaDestino.saldo += valor;    contaOrigem.saldo -= valor;

    transferencias.push({
        data: dataFormatada(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    })
    return res.status(200).json({'mensagem': 'Transferência realizado com sucesso'})


}

const consultarSaldo = (req,res)=>{
    const { numero_conta, senha } = req.query

    const idExistente = contas.find(achar => achar.numero == Number(numero_conta));

    if(!numero_conta){
        res.status(401).json({'mensagem': 'numero da conta nao informado'})
    }
    if(!senha){
          res.status(401).json({'mensagem': 'senha nao informada'})
    }

    if(!idExistente){
        return res.status(404).json({'mensagem':'Conta Não Encontrada'});
    }

    if(senha != idExistente.usuario.senha){
        return res.status(403).json({'mensagem':'Senha Incorreta'});
    }

    res.status(200).json({"saldo": idExistente.saldo})

}

const extrato = (req,res)=>{
    const { numero_conta, senha } = req.query

    const idExistente = contas.find(achar => achar.numero == Number(numero_conta));

    if(!numero_conta){
        res.status(401).json({'mensagem': 'numero da conta nao informado'})
    }
    if(!senha){
          res.status(401).json({'mensagem': 'senha nao informada'})
    }

    if(!idExistente){
        return res.status(404).json({'mensagem':'Conta Não Encontrada'});
    }

    if(senha != idExistente.usuario.senha){
        return res.status(403).json({'mensagem':'Senha Incorreta'});
    }

    const transferenciasEnviadas = transferencias.filter(enviada => 
        Number(enviada.numero_conta_origem) == Number(numero_conta)    
    )
    const transferenciasRecebidas = transferencias.filter(recebida => 
        Number(recebida.numero_conta_origem) != Number(numero_conta)    
    )


    res.status(200).json({depositos, saques, transferenciasEnviadas, transferenciasRecebidas})

}

module.exports = {
    listarContas,
    criarUmaConta,
    modificandoConta,
    deletandoConta,
    depositandoConta,
    sacandoConta,
    transacaoConta,
    consultarSaldo,
    extrato
};
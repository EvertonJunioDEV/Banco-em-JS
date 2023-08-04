const { banco, contas } = require('../bancodedados');

const senhaDoBanco = (req,res,next)=>{ 
    const {senha_banco} = req.query;

    if (!senha_banco){
        return res.status(400).json({"mensagem": 'Senha Não Informada'});
    };

    if (senha_banco != banco.senha){
        return res.status(401).json({"mensagem": 'Senha Não Reconhecida'});
    };

    next()
};

//alterar

module.exports = {
    senhaDoBanco,
}
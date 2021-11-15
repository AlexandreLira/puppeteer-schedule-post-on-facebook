const fs = require('fs')

function TextoEmArray(caminho){
    let texto = fs.readFileSync(caminho, 'utf-8')
    let comeco = 6
    let fim = texto.indexOf('LEGENDA')
    return texto.slice(comeco, fim).trim()
}

module.exports = TextoEmArray
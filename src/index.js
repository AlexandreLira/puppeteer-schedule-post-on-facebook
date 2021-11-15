const fs = require('fs')
const TextoEmArray = require('./lerTxt')

function lerArquivo(caminho){
    var listaDeTextos = []
    var listaDeArquivos = fs.readdirSync(caminho)
    listaDeArquivos.pop()
    listaDeArquivos = listaDeArquivos.sort((a, b) => (a - b))
    for(lista of listaDeArquivos){
        let arquivos = fs.readdirSync(caminho+'/'+lista)
    
        // console.log(lista)
        if(arquivos.indexOf('imagem.jpg') != -1){
           
            listaDeTextos.push({texto: TextoEmArray(caminho+'/'+lista+'/Texto.txt'), arquivo: lista})
    
        } 
    }
    return listaDeTextos
}

module.exports = lerArquivo
/* ARQUIVO COM FUNÇÕES COMUNS A DIVERSOS ALGORITMOS*/

const fs = require('fs');

/* função de escrever os dados da saída */
function writeDataset( objetos, nomeArquivo, dirname ){

    const dir = './' + dirname;

    objetos.sort(function(a,b) {
        if (a.cluster > b.cluster) {
            return 1;
        }
        if (a.cluster < b.cluster) {
            return -1;
        }

          return 0;
    });

    let string = '';

    for(let i=0; i<objetos.length; i++){
        string += objetos[i].label + ' ' + objetos[i].cluster + '\n';
    }

    //cria diretorio se ele nao existe
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir);
 

    fs.writeFile('./' + dirname + '/' + nomeArquivo +'.clu', string, (err) => {
        if (err) {
          console.error(err);
        }
    });

}


//retorna numero inteiro aleatorio entre min e max (inclusivo)
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* função de leitura e formatação dos dados */
async function readDataset( datasetName ){

    let dataSet = [];
    let data;

    try{
        data = fs.readFileSync('./datasets/'+ datasetName, 'utf8');
    } catch(err){
        throw err;
    }

    dataSet = dataFormat(data);
    return dataSet;
}

function dataFormat(data){

    //separando linhas do arquivo de texto
    data = data.split('\n');

    const dataSet = [];

    //dividindo cada linha em um objeto com seus atributos
    for(let i=0; i<data.length; i++){
        const obj = element2obj(data[i]);

        if( isNaN(obj.x) )
            continue;

        dataSet.push(obj);
    }
    
    return dataSet;
}

/* função de conversão de tipo para objeto com atributos */
function element2obj(e){

    //transformando espaços em tabs
    e = e.replaceAll(' ','\t');
    
    const att = e.split('\t');

    att[1] = parseFloat(att[1]);
    att[2] = parseFloat(att[2]);

    const objAtt = {
        'label': att[0],
        'x': att[1],
        'y': att[2],
        'cluster': null
    }

    return objAtt;

};

/* função do cálculo da distância euclidiana */
function distEuclidiana(x1, y1, x2, y2){

    const distX = x1 - x2;
    const distY = y1 - y2;
    return Math.sqrt( Math.pow(distX, 2) +  Math.pow(distY, 2) );

}

module.exports = {writeDataset, getRandomIntInclusive, readDataset, distEuclidiana};
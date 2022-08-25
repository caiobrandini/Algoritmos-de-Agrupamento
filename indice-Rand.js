const fs = require('fs');

const ARQUIVO_PARTICAO1 = process.argv[2];
const ARQUIVO_PARTICAO2 = process.argv[3];

indiceRand();

async function indiceRand(){

    //leitura das partições
    const partition1 = await readPartition(ARQUIVO_PARTICAO1);    
    const partition2 = await readPartition(ARQUIVO_PARTICAO2);

    //ordenação dos objetos por nome
    sortPartition(partition1);
    sortPartition(partition2);

    //calculando valores de A1 e A4
    const a1 = A1(partition1, partition2);
    const a4 = A4(partition1, partition2);

    const numeroObjetos = partition1.length;
    const totalDePares = numeroObjetos * (numeroObjetos - 1) / 2;

    const indice = ( a1 + a4 ) / totalDePares;

    console.log('índice Rand = ' + indice);
}

/* ordena partições pelo nome de cada objeto */
function sortPartition(p){

    p.sort(function(a, b) {
        if (a.label > b.label) {
            return 1;
        }
        if (a.label < b.label) {
            return -1;
        }
    
          return 0;
    });

} 

/* retorna quantidade de pares de objetos que pertemcem a um mesmo cluster nas duas partições */
function A1(p1 ,p2){

    let count = 0;

    //iterando sobre todas as combinações possiveis entre os pares de objetos
    for(let i = 0; i < p1.length; i++)
        for(let j = i+1; j < p2.length; j++)
            if(p1[i].cluster === p1[j].cluster && p2[i].cluster === p2[j].cluster)
                count++;

    return count;
}

/* retorna quantidade de pares de objetos que pertemcem a partições diferentes nas duas partições */
function A4(p1, p2){

    let count = 0;

    //iterando sobre todas as combinações possiveis entre os pares de objetos
    for(let i = 0; i < p1.length; i++)
        for(let j = i+1; j < p2.length; j++)
            if(p1[i].cluster !== p1[j].cluster && p2[i].cluster !== p2[j].cluster)
                count++;

    return count;
}

/* função de leitura e formatação dos dados */
async function readPartition( datasetName ){

    let dataSet = [];

    let data = fs.readFileSync('./datasets/'+ datasetName, 'utf8');

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

        if( isNaN(obj.cluster) )
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

    att[1] = parseInt(att[1]);

    const objAtt = {
        'label': att[0],
        'cluster': att[1]
    }

    return objAtt;
};

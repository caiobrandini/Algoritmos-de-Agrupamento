const globals = require('./globals');

const ARQUIVO_DATASET = process.argv[2];
const NUMERO_CLUSTERS = process.argv[3] || 2;
const NUMERO_ITERACOES = process.argv[4] || 100;



kMedias();

/* função principal */
async function kMedias(){

    if(!ARQUIVO_DATASET){
        console.log('Forneça o nome e extensão do arquivo de entrada');
        return;
    }
    
    //leitura dos objetos de entrada (dataset)
    let objetos;
    try{
        objetos = await globals.readDataset(ARQUIVO_DATASET);
    } catch(err){
        console.log('Erro ao ler arquivo: ' + ARQUIVO_DATASET);
        return;
    }


    //selecionando centroides iniciais
    let clusters = centroidesIniciais(objetos);

    //atribuindo cada objeto a um cluster
    for(let i=0; i<objetos.length; i++){
        categorizaObjetos(objetos[i], clusters);
    }
    
    //ITERAÇÕES
    for(let it = 0; it< NUMERO_ITERACOES; it++){
        
        //calculando os novos valores dos centroides de cada cluster
        for(let i=0; i<NUMERO_CLUSTERS; i++){
            recalculaCentroide(objetos, i);
        }

        //atribuindo cada objeto a um cluster
        for(let i=0; i<objetos.length; i++){
            categorizaObjetos(objetos[i], clusters);
        }

    }

    globals.writeDataset(objetos, ARQUIVO_DATASET.slice(0, -4), 'k-medias');
}


//selecionando centroides iniciais de forma aleatoria
function centroidesIniciais( objetos ){

    let clusters = [];
    let arrObjetos = objetos.slice();

    for(let i=0; i<NUMERO_CLUSTERS; i++){
        
        num = globals.getRandomIntInclusive(0, arrObjetos.length);

        let c = {
            'x': arrObjetos[num].x,
            'y': arrObjetos[num].y
        }

        clusters.push(c);
        arrObjetos.splice(num, 1);
    }

    return clusters;
}



/* função que recalcula os atributos dos clusters */
function recalculaCentroide(objetos, clusterIndex){
    
    let mediaX = 0, mediaY = 0, quantidade = 0;

    for(let i=0; i<objetos.length; i++){
        
        if(objetos[i].cluster == clusterIndex){
            mediaX += objetos[i].x;
            mediaY += objetos[i].y;
            quantidade++;
        }
        
    }

    mediaX /= quantidade;
    mediaY /= quantidade;
    
    const novoCluster = {
        'x': mediaX,
        'y': mediaY,
    }
    
    return novoCluster;
}

/* função que categoriza um objeto a um cluster */
function categorizaObjetos( objeto, clusters ){

    let menorDistancia = null;

    for(let i=0; i<clusters.length; i++){
        const dist = globals.distEuclidiana(objeto.x, objeto.y, clusters[i].x, clusters[i].y);

        if(menorDistancia == null || dist < menorDistancia){
            objeto.cluster = i;
            menorDistancia = dist;
        }

    }
}
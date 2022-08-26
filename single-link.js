const globals = require('./globals');

const ARQUIVO_DATASET = process.argv[2];
const K = process.argv[3] || 2;

singleLink();

async function singleLink(){
    
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

    //calculo das distancias euclidianas entre todas as combinacoes
    const m = distanciasIniciais(objetos);

    //criacao das particoes
    const particao = agruparObjetos(m, objetos.length);

    const pFormatada = formatarParticao(particao, objetos);

    globals.writeDataset(pFormatada, ARQUIVO_DATASET.slice(0, -4));

}

function formatarParticao( p, objetos ){

    let newP = [];
    let nClusters = p.length;

    for(let i = 0; i < objetos.length; i++){

        const label = objetos[i].label;

        for(let j=0; j<p.length; j++){

            //objeto encontrado em algum cluster formado
            if(p[j][label]){
                
                const o = {
                    label: label,
                    cluster: j
                }

                newP.push(o);
                break;
            }

            //objeto nao encontrado nos clusters formados
            if(j == p.length - 1){

                const o = {
                    label: label,
                    cluster: nClusters
                }

                newP.push(o);

                nClusters++;
            }

        }

    }

    return newP;
}

/* Retorna um objeto contendo a distancia entre cada uma das possiveis duplas de objetos */
function distanciasIniciais(dataset) {

    const m = [];

    for(let i = 0; i < dataset.length; i++){
        for(let j = i+1; j < dataset.length; j++){

            const dist = globals.distEuclidiana(dataset[i].x, dataset[i].y, dataset[j].x, dataset[j].y);

            const objDist = {
                'label1': dataset[i].label,
                'label2': dataset[j].label,
                'dist': dist
            }

            m.push(objDist);

        }
    }

    ordenarDistancias(m);

    return m;
}

function ordenarDistancias( m ){
    
    m.sort(function(a,b){
        if (a.dist > b.dist){
            return 1;
        }
        if (a.dist < b.dist){
            return -1;
        }

          return 0;
    });
    
}

//retorna um objeto com os clusters formados
//objetos que ficarem fora dos clusters formados devem ser consideirados em clusters sozinhos
function agruparObjetos( distancias, nObjetos ){
    
    console.log("Iniciando o agrupamento dos objetos...");

    let nClusters = nObjetos;

    let objetosAgrupados = [];

    for(let i = 0; i < distancias.length; i++) {

        //escolhendo dupla pela menor distancia
        const menorDistancia = distancias[i];

        let clusterA = null;
        let clusterB = null;

        const label1 = menorDistancia['label1'];
        const label2 = menorDistancia['label2'];

        if(nClusters == K)
            break;

        //verificando a qual cluster os objetos de menor distancia pertencem
        for(let j=0; j < objetosAgrupados.length; j++) {

            const cluster = objetosAgrupados[j];

            if (cluster[label1] != undefined){
                clusterA = objetosAgrupados[j];
            }
            
            if (cluster[label2] != undefined){
                clusterB = objetosAgrupados[j];
            }
                
        }
        
        // Caso 1: nenhum dos objetos esta nos agrupados - Criar novo objAgrupado
        if (clusterA === null && clusterB === null) {

            let novoCluster = {};
            
            novoCluster[label1] = true;
            novoCluster[label2] = true;
            objetosAgrupados.push(novoCluster);

            nClusters--;
        }

        // Caso 2: o primeiro objeto ja esta agrupado - Juntar o segundo no primeiro
        else if (clusterA !== null && clusterB === null) {
            clusterA[label2] = true;
            nClusters--;
        }

        // Caso 3: o segundo objeto ja esta agrupado - Juntar o primeiro no segundo
        else if (clusterA === null && clusterB !== null) {
            clusterB[label1] = true;
            nClusters--;
        }

        // Caso 4: os dois estão agrupados separados - Adicionar em um e tira do outro*
        else if (clusterA !== null && clusterB !== null) {

            let clusterNovo = {...clusterA, ...clusterB}

            //removendo segundo cluster
            const idx = objetosAgrupados.indexOf(clusterB);
            objetosAgrupados.splice(idx, 1);

            const idx2 = objetosAgrupados.indexOf(clusterA);
            objetosAgrupados.splice(idx2, 1);

            objetosAgrupados.push(clusterNovo)
            nClusters--;
        }

        // Caso 5: os dois estão agrupados juntos
    }

    return objetosAgrupados;

}


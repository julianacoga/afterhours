
const URL_API = 'http://localhost:3001';

const TIPOS_INGRESSO = [
    'Pista',
    'VIP',
    'Camarote'
];

async function inicializar() {
    adicionarModalidade();
    await carregarEventos();
    await listar();
}

async function carregarEventos() {
    const select = document.getElementById('selectEvento');

    try {
        const resposta = await fetch(`${URL_API}/evento/listar`);
        const data = await resposta.json();

        if (!resposta.ok || !data.sucesso) {
            throw new Error(data.mensagem || 'Erro ao buscar eventos.');
        }

        select.innerHTML = '<option value="">Selecione um evento</option>';

        data.eventos.forEach(evento => {
            const opcao = document.createElement('option');

            opcao.value = evento.id_evento;
            opcao.textContent = `${evento.id_evento} - ${evento.titulo_evento}`;

            select.appendChild(opcao);
        });

    } catch (erro) {
        console.error('Erro ao carregar eventos:', erro);
        select.innerHTML = '<option value="">Erro ao carregar eventos</option>';
        mostrarAviso('Não foi possível carregar os eventos.');
    }
}

function adicionarModalidade() {
    const lista = document.getElementById('listaModalidades');

    if (lista.children.length >= TIPOS_INGRESSO.length) {
        mostrarAviso('Todas as modalidades disponíveis já foram adicionadas.');
        return;
    }

    const numero = lista.children.length + 1;

    const div = document.createElement('div');
    div.className = 'modalidade';

    div.innerHTML = `
        <div class="modalidade-cabecalho">
            <h3>Modalidade ${numero}</h3>
            <button type="button" class="btRemover"
                onclick="removerModalidade(this)">
                Remover
            </button>
        </div>

        <label>Tipo de ingresso</label>
        <select class="tipoIngresso" onchange="atualizarOpcoesTipos()">
            <option value="">Selecione o tipo</option>
            ${TIPOS_INGRESSO.map(tipo =>
                `<option value="${tipo}">${tipo}</option>`
            ).join('')}
        </select>

        <div class="campos-modalidade">
            <div>
                <label>Quantidade</label>
                <input
                    type="number"
                    class="quantidadeIngresso"
                    min="0"
                    step="1"
                    placeholder="Ex: 500">
            </div>

            <div>
                <label>Valor (R$)</label>
                <input
                    type="number"
                    class="precoIngresso"
                    min="0"
                    step="0.01"
                    placeholder="Ex: 80,00">
            </div>
        </div>
    `;

    lista.appendChild(div);

    atualizarOpcoesTipos();
    atualizarNumeracao();
}

function removerModalidade(botao) {
    botao.closest('.modalidade').remove();

    atualizarOpcoesTipos();
    atualizarNumeracao();
}

function atualizarNumeracao() {
    const modalidades = document.querySelectorAll('.modalidade');

    modalidades.forEach((modalidade, indice) => {
        modalidade.querySelector('h3').textContent =
            `Modalidade ${indice + 1}`;
    });
}

function atualizarOpcoesTipos() {
    const selects = document.querySelectorAll('.tipoIngresso');

    const selecionados = Array.from(selects)
        .map(select => select.value)
        .filter(valor => valor !== '');

    selects.forEach(select => {
        Array.from(select.options).forEach(opcao => {
            if (opcao.value === '') return;

            opcao.disabled =
                selecionados.includes(opcao.value) &&
                select.value !== opcao.value;
        });
    });
}

async function salvarIngressos() {
    const eventoId = document.getElementById('selectEvento').value;

    if (!eventoId) {
        mostrarAviso('Selecione um evento.');
        return;
    }

    const modalidades = document.querySelectorAll('.modalidade');

    if (modalidades.length === 0) {
        mostrarAviso('Adicione pelo menos uma modalidade.');
        return;
    }

    const ingressos = [];

    for (const modalidade of modalidades) {
        const nome = modalidade.querySelector('.tipoIngresso').value;
        const quantidade = modalidade.querySelector('.quantidadeIngresso').value;
        const preco = modalidade.querySelector('.precoIngresso').value;

        if (!nome || quantidade === '' || preco === '') {
            mostrarAviso('Preencha todos os campos das modalidades.');
            return;
        }

        if (
            !Number.isInteger(Number(quantidade)) ||
            Number(quantidade) < 0 ||
            !Number.isFinite(Number(preco)) ||
            Number(preco) < 0
        ) {
            mostrarAviso('Confira as quantidades e os valores informados.');
            return;
        }

        ingressos.push({
            nome_ingresso: nome,
            quantidade_estoque_ingresso: Number(quantidade),
            preco_unitario_ingresso: Number(preco)
        });
    }

    const dados = {
        evento_id_evento: Number(eventoId),
        ingressos
    };

    try {
        const resposta = await fetch(`${URL_API}/ingresso/lote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem || 'Erro ao cadastrar ingressos.');
        }

        mostrarAviso(resultado.mensagem);

        document.getElementById('listaModalidades').innerHTML = '';
        adicionarModalidade();

        await listar();

    } catch (erro) {
        console.error('Erro ao salvar ingressos:', erro);
        mostrarAviso(erro.message);
    }
}

a
async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/ingresso/listar`);
        const data = await resposta.json();

        if (!resposta.ok || !data.sucesso) {
            throw new Error('Erro ao buscar ingressos.');
        }

        const saida = document.getElementById('outputSaida');

        if (data.ingressos.length === 0) {
            saida.innerHTML = '<p class="sem-ingressos">Nenhum ingresso cadastrado.</p>';
            return;
        }

        const tabela = document.createElement('table');
        tabela.className = 'tabela-ingressos';

        tabela.innerHTML = `
            <thead>
                <tr>
                    <th>Modalidade</th>
                    <th>Evento</th>
                    <th>Valor</th>
                    <th>Estoque</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;

        const corpo = tabela.querySelector('tbody');

        data.ingressos.forEach(ingresso => {
            const linha = document.createElement('tr');

            const modalidade = document.createElement('td');
            modalidade.textContent = ingresso.nome_ingresso;

            const evento = document.createElement('td');
            evento.textContent = ingresso.titulo_evento;

            const preco = document.createElement('td');
            preco.textContent =
                `R$ ${Number(ingresso.preco_unitario_ingresso).toFixed(2).replace('.', ',')}`;

            const quantidade = document.createElement('td');
            quantidade.textContent = ingresso.quantidade_estoque_ingresso;

            linha.append(modalidade, evento, preco, quantidade);
            corpo.appendChild(linha);
        });

        saida.innerHTML = '';
        saida.appendChild(tabela);

    } catch (erro) {
        console.error('Erro ao listar ingressos:', erro);

        document.getElementById('outputSaida').textContent =
            'Erro ao carregar ingressos.';
    }
}


function mostrarAviso(mensagem) {
    document.getElementById('divAviso').textContent = mensagem;
}

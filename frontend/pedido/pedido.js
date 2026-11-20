
const URL_API = 'http://localhost:3001';

let ingressosDisponiveis = [];
let modo = '';

async function inicializar() {
    bloquearCampos();
    await carregarIngressos();
    await listar();
}

async function carregarIngressos() {
    try {
        const resposta = await fetch(`${URL_API}/ingresso/listar`);
        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error('Não foi possível carregar os ingressos.');
        }

        ingressosDisponiveis = resultado.ingressos;

    } catch (erro) {
        console.error(erro);
        mostrarAviso(erro.message);
    }
}

function mostrarAviso(mensagem) {
    document.getElementById('divAviso').textContent = mensagem;
}

function bloquearCampos() {
    document.getElementById('inputCpf_cliente').disabled = true;
    document.getElementById('inputCpf_funcionario').disabled = true;
    document.getElementById('selectStatus').disabled = true;
    document.getElementById('btAdicionar').disabled = true;
}

function liberarCampos() {
    document.getElementById('inputCpf_cliente').disabled = false;
    document.getElementById('inputCpf_funcionario').disabled = false;
    document.getElementById('selectStatus').disabled = false;
    document.getElementById('btAdicionar').disabled = false;
}

function esconderBotoes() {
    ['btInserir', 'btAlterar', 'btExcluir', 'btSalvar', 'btCancelar'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });

    document.getElementById('btProcure').style.display = 'inline-block';
}

function limparCampos() {
    document.getElementById('inputCpf_cliente').value = '';
    document.getElementById('inputCpf_funcionario').value = '';
    document.getElementById('selectStatus').value = 'Pendente';
    document.getElementById('listaItens').innerHTML = '';
    document.getElementById('valorTotal').textContent = 'R$ 0,00';
}

function adicionarItem(idSelecionado = '', quantidade = 1) {
    const lista = document.getElementById('listaItens');

    const item = document.createElement('div');
    item.className = 'item-pedido';

    const opcoes = ingressosDisponiveis.map(ingresso => `
        <option value="${ingresso.id_ingresso}"
            ${String(ingresso.id_ingresso) === String(idSelecionado) ? 'selected' : ''}>
            ${ingresso.nome_ingresso} - ${ingresso.titulo_evento}
        </option>
    `).join('');

    item.innerHTML = `
        <div class="item-pedido-cabecalho">
            <strong>Ingresso</strong>
            <button type="button" class="btRemover" onclick="removerItem(this)">
                Remover
            </button>
        </div>

        <label>Modalidade</label>
        <select class="selectIngresso" onchange="atualizarTotal()">
            <option value="">Selecione um ingresso</option>
            ${opcoes}
        </select>

        <label>Quantidade</label>
        <input type="number" class="quantidadeItem" min="1"
            value="${quantidade}" oninput="atualizarTotal()">

        <p class="subtotal">Subtotal: R$ 0,00</p>
    `;

    lista.appendChild(item);
    atualizarTotal();
}

function removerItem(botao) {
    botao.closest('.item-pedido').remove();
    atualizarTotal();
}

function atualizarTotal() {
    let total = 0;

    document.querySelectorAll('.item-pedido').forEach(item => {
        const id = item.querySelector('.selectIngresso').value;
        const quantidade = Number(item.querySelector('.quantidadeItem').value);

        const ingresso = ingressosDisponiveis.find(
            i => String(i.id_ingresso) === String(id)
        );

        const preco = ingresso ? Number(ingresso.preco_unitario_ingresso) : 0;
        const subtotal = preco * (Number.isFinite(quantidade) ? quantidade : 0);

        item.querySelector('.subtotal').textContent =
            `Subtotal: ${subtotal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })}`;

        total += subtotal;
    });

    document.getElementById('valorTotal').textContent =
        total.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
}

function obterDados() {
    const ingressos = [];

    document.querySelectorAll('.item-pedido').forEach(item => {
        ingressos.push({
            ingresso_id_ingresso: Number(
                item.querySelector('.selectIngresso').value
            ),
            quantidade: Number(
                item.querySelector('.quantidadeItem').value
            )
        });
    });

    return {
        cliente_pessoa_cpf_pessoa:
            document.getElementById('inputCpf_cliente').value,

        funcionario_pessoa_cpf_pessoa:
            document.getElementById('inputCpf_funcionario').value,

        status_pedido:
            document.getElementById('selectStatus').value,

        ingressos
    };
}

function validarDados(dados) {
    if (!dados.cliente_pessoa_cpf_pessoa || !dados.funcionario_pessoa_cpf_pessoa) {
        mostrarAviso('Informe o CPF do cliente e do funcionário.');
        return false;
    }

    if (dados.ingressos.length === 0) {
        mostrarAviso('Adicione pelo menos um ingresso.');
        return false;
    }

    const ids = new Set();

    for (const item of dados.ingressos) {
        if (
            !item.ingresso_id_ingresso ||
            !Number.isInteger(item.quantidade) ||
            item.quantidade <= 0
        ) {
            mostrarAviso('Selecione os ingressos e informe quantidades válidas.');
            return false;
        }

        if (ids.has(item.ingresso_id_ingresso)) {
            mostrarAviso('Não repita o mesmo ingresso. Ajuste a quantidade na linha existente.');
            return false;
        }

        ids.add(item.ingresso_id_ingresso);
    }

    return true;
}

async function procure() {
    const id = document.getElementById('inputId_pedido').value;

    if (!id || Number(id) <= 0) {
        mostrarAviso('Informe um ID válido.');
        return;
    }

    try {
        const resposta = await fetch(`${URL_API}/pedido/${id}`);
        const resultado = await resposta.json();

        limparCampos();
        esconderBotoes();

        if (resposta.ok && resultado.sucesso) {
            const pedido = resultado.pedido;

            document.getElementById('inputCpf_cliente').value =
                pedido.cliente_pessoa_cpf_pessoa;

            document.getElementById('inputCpf_funcionario').value =
                pedido.funcionario_pessoa_cpf_pessoa;

            document.getElementById('selectStatus').value =
                pedido.status_pedido;

            resultado.itens.forEach(item => {
                adicionarItem(item.ingresso_id_ingresso, item.quantidade);
            });

            bloquearCampos();

            document.getElementById('btAlterar').style.display = 'inline-block';
            document.getElementById('btExcluir').style.display = 'inline-block';

            mostrarAviso('Pedido encontrado!');

        } else {
            liberarCampos();

            document.getElementById('btInserir').style.display = 'inline-block';
            document.getElementById('btCancelar').style.display = 'inline-block';

            adicionarItem();

            mostrarAviso('Pedido não encontrado. Você pode cadastrar um novo.');
        }

    } catch (erro) {
        console.error(erro);
        mostrarAviso('Não foi possível consultar o pedido.');
    }
}

async function inserir() {
    const dados = obterDados();

    if (!validarDados(dados)) return;

    try {
        const resposta = await fetch(`${URL_API}/pedido`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem);
        }

        document.getElementById('inputId_pedido').value = resultado.id_pedido;

        bloquearCampos();
        esconderBotoes();

        document.getElementById('btAlterar').style.display = 'inline-block';
        document.getElementById('btExcluir').style.display = 'inline-block';

        mostrarAviso(resultado.mensagem);
        await listar();

    } catch (erro) {
        console.error(erro);
        mostrarAviso(erro.message || 'Erro ao cadastrar pedido.');
    }
}

function alterar() {
    liberarCampos();

    document.getElementById('btAlterar').style.display = 'none';
    document.getElementById('btExcluir').style.display = 'none';
    document.getElementById('btProcure').style.display = 'none';

    document.getElementById('btSalvar').style.display = 'inline-block';
    document.getElementById('btCancelar').style.display = 'inline-block';

    mostrarAviso('Altere os dados e clique em Salvar.');
}

async function salvar() {
    const id = document.getElementById('inputId_pedido').value;
    const dados = obterDados();

    if (!validarDados(dados)) return;

    try {
        const resposta = await fetch(`${URL_API}/pedido/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem);
        }

        bloquearCampos();
        esconderBotoes();

        document.getElementById('btAlterar').style.display = 'inline-block';
        document.getElementById('btExcluir').style.display = 'inline-block';

        mostrarAviso(resultado.mensagem);
        await listar();

    } catch (erro) {
        console.error(erro);
        mostrarAviso(erro.message || 'Erro ao alterar pedido.');
    }
}

async function excluir() {
    const id = document.getElementById('inputId_pedido').value;

    if (!id) {
        mostrarAviso('Informe o ID do pedido.');
        return;
    }

    if (!confirm('Deseja realmente excluir este pedido?')) return;

    try {
        const resposta = await fetch(`${URL_API}/pedido/${id}`, {
            method: 'DELETE'
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem);
        }

        cancelarOperacao();
        mostrarAviso(resultado.mensagem);
        await listar();

    } catch (erro) {
        console.error(erro);
        mostrarAviso(erro.message || 'Erro ao excluir pedido.');
    }
}

function cancelarOperacao() {
    document.getElementById('inputId_pedido').value = '';

    limparCampos();
    bloquearCampos();
    esconderBotoes();

    mostrarAviso('Informe o ID do pedido e clique em Procure.');
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/pedido/listar`);
        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error('Erro ao listar pedidos.');
        }

        const saida = document.getElementById('outputSaida');
        saida.innerHTML = '';

        if (resultado.pedidos.length === 0) {
            saida.textContent = 'Nenhum pedido cadastrado.';
            return;
        }

        resultado.pedidos.forEach(pedido => {
            const item = document.createElement('div');
            item.className = 'item-lista-pedido';

            const titulo = document.createElement('strong');
            titulo.textContent = `Pedido #${pedido.id_pedido}`;

            const status = document.createElement('p');
            status.textContent = `Status: ${pedido.status_pedido}`;

            const data = document.createElement('p');
            data.textContent = `Data: ${new Date(pedido.data_pedido).toLocaleString('pt-BR')}`;

            const total = document.createElement('p');
            total.textContent = `Total: ${Number(pedido.valor_total).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })}`;

            item.append(titulo, status, data, total);
            saida.appendChild(item);
        });

    } catch (erro) {
        console.error(erro);
        document.getElementById('outputSaida').textContent =
            'Erro ao carregar pedidos.';
    }
}

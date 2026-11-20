
const URL_API = 'http://localhost:3001';

let modoEdicao = false;


// INICIALIZAR
async function inicializar() {
    bloquearCampos();
    await listar();
}


// CAMPOS DO FORMULÁRIO
function bloquearCampos() {
    document.getElementById('inputTitulo_evento').disabled = true;
    document.getElementById('inputDescricao_evento').disabled = true;
    document.getElementById('inputLocal_evento').disabled = true;
    document.getElementById('inputEndereco_evento').disabled = true;
    document.getElementById('inputData_evento').disabled = true;
    document.getElementById('inputHorario_evento').disabled = true;
    document.getElementById('inputImagem_evento').disabled = true;
    document.getElementById('selectStatus_evento').disabled = true;
    document.getElementById('inputCpf_funcionario').disabled = true;
}

function liberarCampos() {
    document.getElementById('inputTitulo_evento').disabled = false;
    document.getElementById('inputDescricao_evento').disabled = false;
    document.getElementById('inputLocal_evento').disabled = false;
    document.getElementById('inputEndereco_evento').disabled = false;
    document.getElementById('inputData_evento').disabled = false;
    document.getElementById('inputHorario_evento').disabled = false;
    document.getElementById('inputImagem_evento').disabled = false;
    document.getElementById('selectStatus_evento').disabled = false;
    document.getElementById('inputCpf_funcionario').disabled = false;
}


// CONTROLE DOS BOTÕES
function esconderBotoes() {
    document.getElementById('btInserir').style.display = 'none';
    document.getElementById('btAlterar').style.display = 'none';
    document.getElementById('btExcluir').style.display = 'none';
    document.getElementById('btSalvar').style.display = 'none';
    document.getElementById('btCancelar').style.display = 'none';
    document.getElementById('btProcure').style.display = 'inline-block';
}

function limparCampos() {
    document.getElementById('inputTitulo_evento').value = '';
    document.getElementById('inputDescricao_evento').value = '';
    document.getElementById('inputLocal_evento').value = '';
    document.getElementById('inputEndereco_evento').value = '';
    document.getElementById('inputData_evento').value = '';
    document.getElementById('inputHorario_evento').value = '';
    document.getElementById('inputImagem_evento').value = '';
    document.getElementById('selectStatus_evento').value = 'Ativo';
    document.getElementById('inputCpf_funcionario').value = '';
}


// AVISOS
function mostrarAviso(mensagem) {
    document.getElementById('divAviso').textContent = mensagem;
}


// DADOS DO FORMULÁRIO
function obterDados() {
    return {
        titulo_evento: document.getElementById('inputTitulo_evento').value.trim(),
        descricao_evento: document.getElementById('inputDescricao_evento').value.trim(),
        local_evento: document.getElementById('inputLocal_evento').value.trim(),
        endereco_evento: document.getElementById('inputEndereco_evento').value.trim(),
        data_evento: document.getElementById('inputData_evento').value,
        horario_evento: document.getElementById('inputHorario_evento').value,
        imagem_evento: document.getElementById('inputImagem_evento').value.trim(),
        status_evento: document.getElementById('selectStatus_evento').value,
        funcionario_pessoa_cpf_pessoa:
            document.getElementById('inputCpf_funcionario').value
    };
}


function validarDados(dados) {
    if (
        !dados.titulo_evento ||
        !dados.local_evento ||
        !dados.data_evento ||
        !dados.horario_evento ||
        !dados.funcionario_pessoa_cpf_pessoa
    ) {
        mostrarAviso('Preencha todos os campos obrigatórios.');
        return false;
    }

    if (
        !Number.isSafeInteger(Number(dados.funcionario_pessoa_cpf_pessoa)) ||
        Number(dados.funcionario_pessoa_cpf_pessoa) <= 0
    ) {
        mostrarAviso('Informe um CPF válido para o funcionário.');
        return false;
    }

    return true;
}


// PROCURAR EVENTO
async function procure() {
    const id = document.getElementById('inputId_evento').value;

    if (!id || Number(id) <= 0) {
        mostrarAviso('Informe um ID válido.');
        return;
    }

    try {
        const resposta = await fetch(`${URL_API}/evento/${id}`);
        const resultado = await resposta.json();

        limparCampos();
        esconderBotoes();

        if (resposta.ok && resultado.sucesso) {
            const evento = resultado.evento;

            document.getElementById('inputTitulo_evento').value =
                evento.titulo_evento || '';

            document.getElementById('inputDescricao_evento').value =
                evento.descricao_evento || '';

            document.getElementById('inputLocal_evento').value =
                evento.local_evento || '';

            document.getElementById('inputEndereco_evento').value =
                evento.endereco_evento || '';

            document.getElementById('inputData_evento').value =
                String(evento.data_evento).substring(0, 10);

            document.getElementById('inputHorario_evento').value =
                String(evento.horario_evento).substring(0, 5);

            document.getElementById('inputImagem_evento').value =
                evento.imagem_evento || '';

            document.getElementById('selectStatus_evento').value =
                evento.status_evento || 'Ativo';

            document.getElementById('inputCpf_funcionario').value =
                evento.funcionario_pessoa_cpf_pessoa;

            bloquearCampos();

            document.getElementById('btAlterar').style.display = 'inline-block';
            document.getElementById('btExcluir').style.display = 'inline-block';

            mostrarAviso('Evento encontrado!');

        } else {
            bloquearCampos();
            liberarCampos();

            document.getElementById('btInserir').style.display = 'inline-block';
            document.getElementById('btCancelar').style.display = 'inline-block';

            mostrarAviso('Evento não encontrado. Você pode cadastrar um novo.');
        }

    } catch (erro) {
        console.error('Erro ao procurar evento:', erro);
        mostrarAviso('Não foi possível consultar o evento.');
    }
}


// INSERIR EVENTO
async function inserir() {
    const dados = obterDados();

    if (!validarDados(dados)) return;

    try {
        const resposta = await fetch(`${URL_API}/evento`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem || 'Erro ao cadastrar evento.');
        }

        document.getElementById('inputId_evento').value =
            resultado.evento.id_evento;

        mostrarAviso(resultado.mensagem);

        bloquearCampos();
        esconderBotoes();

        document.getElementById('btAlterar').style.display = 'inline-block';
        document.getElementById('btExcluir').style.display = 'inline-block';

        await listar();

    } catch (erro) {
        console.error('Erro ao inserir evento:', erro);
        mostrarAviso(erro.message);
    }
}


// ENTRAR NO MODO DE ALTERAÇÃO
function alterar() {
    modoEdicao = true;

    liberarCampos();

    document.getElementById('btAlterar').style.display = 'none';
    document.getElementById('btExcluir').style.display = 'none';
    document.getElementById('btProcure').style.display = 'none';

    document.getElementById('btSalvar').style.display = 'inline-block';
    document.getElementById('btCancelar').style.display = 'inline-block';

    mostrarAviso('Altere os dados do evento e clique em Salvar.');
}


// SALVAR ALTERAÇÃO
async function salvar() {
    const id = document.getElementById('inputId_evento').value;
    const dados = obterDados();

    if (!id) {
        mostrarAviso('Informe o ID do evento.');
        return;
    }

    if (!validarDados(dados)) return;

    try {
        const resposta = await fetch(`${URL_API}/evento/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem || 'Erro ao alterar evento.');
        }

        modoEdicao = false;

        bloquearCampos();
        esconderBotoes();

        document.getElementById('btAlterar').style.display = 'inline-block';
        document.getElementById('btExcluir').style.display = 'inline-block';

        mostrarAviso(resultado.mensagem);

        await listar();

    } catch (erro) {
        console.error('Erro ao salvar evento:', erro);
        mostrarAviso(erro.message);
    }
}


// EXCLUIR EVENTO
async function excluir() {
    const id = document.getElementById('inputId_evento').value;

    if (!id) {
        mostrarAviso('Informe o ID do evento.');
        return;
    }

    if (!confirm('Tem certeza que deseja excluir este evento?')) {
        return;
    }

    try {
        const resposta = await fetch(`${URL_API}/evento/${id}`, {
            method: 'DELETE'
        });

        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem || 'Erro ao excluir evento.');
        }

        cancelarOperacao();
        mostrarAviso(resultado.mensagem);

        await listar();

    } catch (erro) {
        console.error('Erro ao excluir evento:', erro);
        mostrarAviso(erro.message);
    }
}


// CANCELAR OPERAÇÃO
function cancelarOperacao() {
    modoEdicao = false;

    document.getElementById('inputId_evento').value = '';

    limparCampos();
    bloquearCampos();
    esconderBotoes();

    mostrarAviso('Informe o ID do evento e clique em Procure.');
}


// LISTAR EVENTOS
async function listar() {
    try {
        const resposta = await fetch(`${URL_API}/evento/listar`);
        const resultado = await resposta.json();

        if (!resposta.ok || !resultado.sucesso) {
            throw new Error(resultado.mensagem || 'Erro ao listar eventos.');
        }

        const saida = document.getElementById('outputSaida');
        saida.innerHTML = '';

        if (resultado.eventos.length === 0) {
            saida.textContent = 'Nenhum evento cadastrado.';
            return;
        }

        resultado.eventos.forEach(evento => {
            const item = document.createElement('div');
            item.className = 'item-evento';

            const titulo = document.createElement('strong');
            titulo.textContent = evento.titulo_evento;

            const local = document.createElement('p');
            local.textContent = `Local: ${evento.local_evento}`;

            const data = document.createElement('p');
            const dataEvento = String(evento.data_evento).substring(0, 10);
            const partesData = dataEvento.split('-');
            data.textContent =
                `Data: ${partesData[2]}/${partesData[1]}/${partesData[0]}`;

            const horario = document.createElement('p');
            horario.textContent =
                `Horário: ${String(evento.horario_evento).substring(0, 5)}`;

            const status = document.createElement('p');
            status.textContent = `Status: ${evento.status_evento}`;

            const id = document.createElement('p');
            id.textContent = `ID: ${evento.id_evento}`;

            item.append(titulo, local, data, horario, status, id);
            saida.appendChild(item);
        });

    } catch (erro) {
        console.error('Erro ao listar eventos:', erro);
        document.getElementById('outputSaida').textContent =
            'Erro ao carregar eventos.';
    }
}

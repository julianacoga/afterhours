const { query } = require('../database');

// Listar ingressos
exports.listarIngresso = async (req, res) => {
    try {
        const result = await query(`
            SELECT i.*, e.titulo_evento
            FROM public.ingresso i
            INNER JOIN public.evento e
                ON i.evento_id_evento = e.id_evento
            ORDER BY i.id_ingresso
        `);

        res.json({
            sucesso: true,
            ingressos: result.rows
        });
    } catch (error) {
        console.error('Erro ao listar ingressos:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar ingressos.'
        });
    }
};

// Listar ingressos de um evento
exports.listarPorEvento = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });
        }

        const result = await query(`
            SELECT *
            FROM public.ingresso
            WHERE evento_id_evento = $1
            ORDER BY id_ingresso
        `, [id]);

        res.json({
            sucesso: true,
            ingressos: result.rows
        });
    } catch (error) {
        console.error('Erro ao buscar ingressos:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar ingressos.'
        });
    }
};

// Obter ingresso por ID
exports.obterIngresso = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });
        }

        const result = await query(
            'SELECT * FROM public.ingresso WHERE id_ingresso = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ingresso não encontrado.'
            });
        }

        res.json({
            sucesso: true,
            ingresso: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao obter ingresso:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno do servidor.'
        });
    }
};

// Criar ingresso
exports.criarIngresso = async (req, res) => {
    try {
        const {
            nome_ingresso,
            quantidade_estoque_ingresso,
            preco_unitario_ingresso,
            evento_id_evento
        } = req.body;

        const quantidade = Number(quantidade_estoque_ingresso);
        const preco = Number(preco_unitario_ingresso);
        const evento = Number(evento_id_evento);

        if (
            !nome_ingresso ||
            quantidade_estoque_ingresso == null ||
            preco_unitario_ingresso == null ||
            evento_id_evento == null
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha todos os campos obrigatórios.'
            });
        }

        if (
            !Number.isInteger(quantidade) ||
            quantidade < 0 ||
            !Number.isFinite(preco) ||
            preco < 0 ||
            !Number.isInteger(evento) ||
            evento <= 0
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Dados inválidos.'
            });
        }

        const result = await query(`
            INSERT INTO public.ingresso (
                nome_ingresso,
                quantidade_estoque_ingresso,
                preco_unitario_ingresso,
                evento_id_evento
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [nome_ingresso, quantidade, preco, evento]);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Ingresso cadastrado com sucesso!',
            ingresso: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao criar ingresso:', error);

        if (error.code === '23503') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Evento não encontrado.'
            });
        }

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cadastrar ingresso.'
        });
    }
};

// Atualizar ingresso
exports.atualizarIngresso = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });
        }

        const {
            nome_ingresso,
            quantidade_estoque_ingresso,
            preco_unitario_ingresso,
            evento_id_evento
        } = req.body;

        const quantidade = Number(quantidade_estoque_ingresso);
        const preco = Number(preco_unitario_ingresso);
        const evento = Number(evento_id_evento);

        if (
            !nome_ingresso ||
            quantidade_estoque_ingresso == null ||
            preco_unitario_ingresso == null ||
            evento_id_evento == null ||
            !Number.isInteger(quantidade) ||
            quantidade < 0 ||
            !Number.isFinite(preco) ||
            preco < 0 ||
            !Number.isInteger(evento) ||
            evento <= 0
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Dados inválidos.'
            });
        }

        const result = await query(`
            UPDATE public.ingresso
            SET nome_ingresso = $1,
                quantidade_estoque_ingresso = $2,
                preco_unitario_ingresso = $3,
                evento_id_evento = $4
            WHERE id_ingresso = $5
            RETURNING *
        `, [nome_ingresso, quantidade, preco, evento, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ingresso não encontrado.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Ingresso atualizado com sucesso!',
            ingresso: result.rows[0]
        });
    } catch (error) {
        console.error('Erro ao atualizar ingresso:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao atualizar ingresso.'
        });
    }
};

// Excluir ingresso
exports.deletarIngresso = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        if (isNaN(id)) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID inválido.'
            });
        }

        const result = await query(`
            DELETE FROM public.ingresso
            WHERE id_ingresso = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ingresso não encontrado.'
            });
        }

        res.json({
            sucesso: true,
            mensagem: 'Ingresso excluído com sucesso!'
        });
    } catch (error) {
        console.error('Erro ao excluir ingresso:', error);
        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao excluir ingresso. Verifique se ele possui vendas vinculadas.'
        });
    }
};


// Cadastrar várias modalidades de ingresso de uma vez
exports.criarIngressosEmLote = async (req, res) => {
    try {
        const { evento_id_evento, ingressos } = req.body;

        const evento = Number(evento_id_evento);

        if (
            !Number.isInteger(evento) ||
            evento <= 0 ||
            !Array.isArray(ingressos) ||
            ingressos.length === 0
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Selecione um evento e informe pelo menos uma modalidade.'
            });
        }

        for (const item of ingressos) {
            const nome = item.nome_ingresso?.trim();
            const quantidade = Number(item.quantidade_estoque_ingresso);
            const preco = Number(item.preco_unitario_ingresso);

            if (
                !nome ||
                nome.length > 45 ||
                item.quantidade_estoque_ingresso === '' ||
                item.preco_unitario_ingresso === '' ||
                !Number.isInteger(quantidade) ||
                quantidade < 0 ||
                !Number.isFinite(preco) ||
                preco < 0
            ) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Verifique o nome, preço e quantidade de cada modalidade.'
                });
            }
        }

        // Uma única instrução SQL: ou insere todas as modalidades,
        // ou não insere nenhuma.
        const result = await query(`
            INSERT INTO public.ingresso (
                nome_ingresso,
                quantidade_estoque_ingresso,
                preco_unitario_ingresso,
                evento_id_evento
            )
            SELECT
                dados.nome_ingresso,
                dados.quantidade_estoque_ingresso,
                dados.preco_unitario_ingresso,
                $2
            FROM jsonb_to_recordset($1::jsonb) AS dados(
                nome_ingresso VARCHAR(45),
                quantidade_estoque_ingresso INTEGER,
                preco_unitario_ingresso NUMERIC(10,2)
            )
            RETURNING *
        `, [
            JSON.stringify(ingressos.map(item => ({
                nome_ingresso: item.nome_ingresso.trim(),
                quantidade_estoque_ingresso: Number(item.quantidade_estoque_ingresso),
                preco_unitario_ingresso: Number(item.preco_unitario_ingresso)
            }))),
            evento
        ]);

        res.status(201).json({
            sucesso: true,
            mensagem: 'Todas as modalidades foram cadastradas com sucesso!',
            ingressos: result.rows
        });

    } catch (error) {
        console.error('Erro ao cadastrar ingressos em lote:', error);

        if (error.code === '23503') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Evento não encontrado.'
            });
        }

        res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cadastrar as modalidades.'
        });
    }
};

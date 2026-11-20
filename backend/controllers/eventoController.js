
const { query } = require('../database');

// LISTAR TODOS OS EVENTOS
exports.listarEventos = async (req, res) => {
    try {
        const resultado = await query(`
            SELECT *
            FROM public.evento
            ORDER BY data_evento ASC, horario_evento ASC
        `);

        return res.status(200).json({
            sucesso: true,
            eventos: resultado.rows
        });

    } catch (erro) {
        console.error('Erro ao listar eventos:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao listar eventos.'
        });
    }
};


// BUSCAR EVENTO PELO ID
exports.obterEvento = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do evento inválido.'
            });
        }

        const resultado = await query(
            `SELECT * FROM public.evento WHERE id_evento = $1`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Evento não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            evento: resultado.rows[0]
        });

    } catch (erro) {
        console.error('Erro ao buscar evento:', erro);

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar evento.'
        });
    }
};


// CADASTRAR EVENTO
exports.criarEvento = async (req, res) => {
    try {
        const {
            titulo_evento,
            descricao_evento,
            local_evento,
            endereco_evento,
            data_evento,
            horario_evento,
            imagem_evento,
            status_evento,
            funcionario_pessoa_cpf_pessoa
        } = req.body;

        if (
            !titulo_evento ||
            !local_evento ||
            !data_evento ||
            !horario_evento ||
            !funcionario_pessoa_cpf_pessoa
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha todos os campos obrigatórios.'
            });
        }

        const cpf = Number(funcionario_pessoa_cpf_pessoa);

        if (!Number.isSafeInteger(cpf) || cpf <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'CPF do funcionário inválido.'
            });
        }

        const resultado = await query(`
            INSERT INTO public.evento (
                titulo_evento,
                descricao_evento,
                local_evento,
                endereco_evento,
                data_evento,
                horario_evento,
                imagem_evento,
                status_evento,
                funcionario_pessoa_cpf_pessoa
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `, [
            titulo_evento,
            descricao_evento || null,
            local_evento,
            endereco_evento || null,
            data_evento,
            horario_evento,
            imagem_evento || null,
            status_evento || 'Ativo',
            cpf
        ]);

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Evento cadastrado com sucesso!',
            evento: resultado.rows[0]
        });

    } catch (erro) {
        console.error('Erro ao cadastrar evento:', erro);

        if (erro.code === '23503') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O CPF informado não pertence a um funcionário cadastrado.'
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao cadastrar evento.'
        });
    }
};


// ALTERAR EVENTO
exports.atualizarEvento = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            titulo_evento,
            descricao_evento,
            local_evento,
            endereco_evento,
            data_evento,
            horario_evento,
            imagem_evento,
            status_evento,
            funcionario_pessoa_cpf_pessoa
        } = req.body;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do evento inválido.'
            });
        }

        if (
            !titulo_evento ||
            !local_evento ||
            !data_evento ||
            !horario_evento ||
            !funcionario_pessoa_cpf_pessoa
        ) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Preencha todos os campos obrigatórios.'
            });
        }

        const cpf = Number(funcionario_pessoa_cpf_pessoa);

        if (!Number.isSafeInteger(cpf) || cpf <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'CPF do funcionário inválido.'
            });
        }

        const resultado = await query(`
            UPDATE public.evento
            SET
                titulo_evento = $1,
                descricao_evento = $2,
                local_evento = $3,
                endereco_evento = $4,
                data_evento = $5,
                horario_evento = $6,
                imagem_evento = $7,
                status_evento = $8,
                funcionario_pessoa_cpf_pessoa = $9
            WHERE id_evento = $10
            RETURNING *
        `, [
            titulo_evento,
            descricao_evento || null,
            local_evento,
            endereco_evento || null,
            data_evento,
            horario_evento,
            imagem_evento || null,
            status_evento || 'Ativo',
            cpf,
            id
        ]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Evento não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Evento alterado com sucesso!',
            evento: resultado.rows[0]
        });

    } catch (erro) {
        console.error('Erro ao alterar evento:', erro);

        if (erro.code === '23503') {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'O CPF informado não pertence a um funcionário cadastrado.'
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao alterar evento.'
        });
    }
};


// EXCLUIR EVENTO
exports.deletarEvento = async (req, res) => {
    try {
        const { id } = req.params;

        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'ID do evento inválido.'
            });
        }

        const resultado = await query(`
            DELETE FROM public.evento
            WHERE id_evento = $1
            RETURNING *
        `, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Evento não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Evento excluído com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao excluir evento:', erro);

        if (erro.code === '23503') {
            return res.status(409).json({
                sucesso: false,
                mensagem: 'Não é possível excluir este evento porque existem ingressos ou outros registros vinculados a ele.'
            });
        }

        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao excluir evento.'
        });
    }
};

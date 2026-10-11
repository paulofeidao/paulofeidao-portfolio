const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: 'OK'
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: 'JSON inválido' }) };
    }

    const name = (payload.name || '').trim();
    const message = (payload.message || '').trim();

    if (!name || name.length < 2 || name.length > 80) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Nome inválido' }) };
    }

    if (!message || message.length < 5 || message.length > 1000) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'O comentário deve ter entre 5 e 1000 caracteres.' })
        };
    }

    const { error } = await supabase.from('comments').insert({
        name,
        message,
        status: 'pending'
    });

    if (error) {
        console.error('Supabase error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Erro ao guardar o comentário.' })
        };
    }

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            ok: true,
            message: 'Obrigado! O teu comentário foi enviado e será revisto antes de aparecer.'
        })
    };
};
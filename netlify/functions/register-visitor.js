const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: 'JSON inválido' }) };
    }

    const name = (payload.name || '').trim();
    if (!name || name.length < 2 || name.length > 80) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Nome inválido' }) };
    }

    const { error } = await supabase.from('visitors').insert({
        name,
        reason: (payload.reason || '').slice(0, 200),
        page: (payload.page || '').slice(0, 300),
        referrer: (payload.referrer || '').slice(0, 300),
        user_agent: (payload.userAgent || '').slice(0, 300)
    });

    if (error) {
        return { statusCode: 500, body: JSON.stringify({ message: 'Erro ao guardar' }) };
    }

    return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true })
    };
};
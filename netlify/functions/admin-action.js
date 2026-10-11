const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

function isAuthorized(event) {
    const auth = event.headers.authorization || event.headers.Authorization || '';
    const expected = 'Bearer ' + process.env.ADMIN_PASSWORD;
    return auth === expected;
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: 'OK'
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    if (!isAuthorized(event)) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Não autorizado' }) };
    }

    let payload;
    try {
        payload = JSON.parse(event.body || '{}');
    } catch {
        return { statusCode: 400, body: JSON.stringify({ message: 'JSON inválido' }) };
    }

    const { id, action } = payload;

    if (!id || !action) {
        return { statusCode: 400, body: JSON.stringify({ message: 'Faltam parâmetros.' }) };
    }

    if (action === 'approve') {
        const { error } = await supabase
            .from('comments')
            .update({ status: 'approved', approved_at: new Date().toISOString() })
            .eq('id', id);

        if (error) {
            return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
        }
        return { statusCode: 200, body: JSON.stringify({ ok: true, status: 'approved' }) };
    }

    if (action === 'reject') {
        const { error } = await supabase
            .from('comments')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (error) {
            return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
        }
        return { statusCode: 200, body: JSON.stringify({ ok: true, status: 'rejected' }) };
    }

    if (action === 'delete') {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) {
            return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
        }
        return { statusCode: 200, body: JSON.stringify({ ok: true, status: 'deleted' }) };
    }

    return { statusCode: 400, body: JSON.stringify({ message: 'Ação inválida.' }) };
};
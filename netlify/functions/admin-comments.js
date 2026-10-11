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
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: 'OK'
        };
    }

    if (!isAuthorized(event)) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Não autorizado' }) };
    }

    const status = (event.queryStringParameters?.status || 'all');

    let query = supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

    if (status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: error.message })
        };
    }

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ comments: data || [] })
    };
};
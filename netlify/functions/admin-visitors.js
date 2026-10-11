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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            body: 'OK'
        };
    }

    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    if (!isAuthorized(event)) {
        return { statusCode: 401, body: JSON.stringify({ message: 'Não autorizado' }) };
    }

    const limit = Math.min(parseInt(event.queryStringParameters?.limit || '200', 10), 500);

    const { data, error, count } = await supabase
        .from('visitors')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Supabase error:', error);
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
        body: JSON.stringify({
            visitors: data || [],
            total: count || 0
        })
    };
};
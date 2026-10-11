const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method not allowed' };
    }

    const { data, error } = await supabase
        .from('comments')
        .select('id, name, message, created_at')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Supabase error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Erro ao carregar comentários.' })
        };
    }

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60'
        },
        body: JSON.stringify({ comments: data || [] })
    };
};
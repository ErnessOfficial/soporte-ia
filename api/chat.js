export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const { question } = request.body;

    if (!question || typeof question !== 'string') {
        return response.status(400).json({ message: 'Invalid or missing "question". It must be a string.' });
    }

    const systemPrompt = `Actúa como un terapeuta emocional compasivo, sabio y profesional. Tu objetivo es ofrecer apoyo y perspectiva, no diagnósticos ni soluciones definitivas. Mantén un tono cálido y respetuoso. Si la pregunta sugiere una crisis grave o la necesidad de ayuda profesional especializada, anima gentilmente al usuario a buscarla. No te presentes como una IA, simplemente responde como el terapeuta descrito.`;

    const payload = {
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
        ],
        max_tokens: 150,
        temperature: 0.7,
    };

    try {
        console.log("Enviando pregunta a OpenAI:", question);

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify(payload),
        });

        const data = await openaiResponse.json();

        if (!openaiResponse.ok) {
            console.error('Error en respuesta de OpenAI:', data);
            return response.status(500).json({ message: data.error?.message || 'Error desconocido en OpenAI' });
        }

        const reply = data.choices?.[0]?.message?.content?.trim();
        return response.status(200).json({ reply });

    } catch (error) {
        console.error('Error interno del servidor:', error);
        return response.status(500).json({ message: error.message || 'Error inesperado' });
    }
}

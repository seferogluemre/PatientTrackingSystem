export const generateWithGemini = async (prompt: string) => {
    const apiKey = "AIzaSyCBGo-OkQ9pVbdbZfork3jZybje9sV3xuk";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            {
                parts: [{ text: prompt }],
            },
        ],
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
};
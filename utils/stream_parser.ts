//https://stackoverflow.com/questions/75782864/how-can-i-send-stream-data-via-api-to-nuxt3-application
/**
Parses a stream and calls a callback function for each token.
@param {Response} stream - The stream to parse.
@param {CallableFunction} forEachToken - The callback function to call for each token.
@returns {Promise} - A promise that resolves when parsing is complete. */
export async function parseStream(stream: Response, forEachToken: CallableFunction) {

    const reader = stream.body!.getReader();
    const decoder = new TextDecoder('utf-8');
    const read = async () => {
        const { done, value } = await reader.read();
        if (done) {
            //console.log("[DONE STREAMING]");
            return reader.releaseLock();
        }

        const chunk = decoder.decode(value, { stream: true });
        const temp = chunk.replace(/\}/g, '},');
        const text = temp
            .split(',')
            .map((data) => {
                const trimData = data.trim();
                //console.log(trimData);
                //if (trimData === '') return undefined;
                //if (trimData === '{"content":"\n\n"}') return undefined;
                if (trimData === '[DONE]') return undefined;
                return data;
            })
            .filter((data) => data) as string[];

        //mine
        text.forEach((value) => {
            forEachToken(value);
        })
        return read();
    };
    await read();
}
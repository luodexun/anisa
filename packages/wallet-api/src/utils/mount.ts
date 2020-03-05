

export const mountServer = async (name, server) => {
    try {
        await server.start();

        console.log(`${name} Server running at: ${server.info.uri}`);

        return server;
    } catch (error) {
        console.log(`Could not start ${name} Server!`, error);
    }
};

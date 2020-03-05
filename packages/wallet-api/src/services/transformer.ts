class Transformer {
    private readonly transformers: Record<string, any> = {

    };

    public toResource(data, transformer, transform: boolean = true): object {
        return this.transformers[transformer](data, transform);
    }

    public toCollection(data, transformer, transform: boolean = true): object[] {
        return data.map(d => this.toResource(d, transformer, transform));
    }
}

export const transformerService = new Transformer();

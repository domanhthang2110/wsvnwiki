declare module 'google-translate-api-x' {
    export interface TranslateOptions {
        from?: string;
        to?: string;
        forceFrom?: boolean;
        forceTo?: boolean;
        forceBatch?: boolean;
        autoCorrect?: boolean;
        rejectOnFreeProp?: boolean;
        client?: 't' | 'gtx';
    }

    export interface TranslateResult {
        text: string;
        from: {
            language: {
                didYouMean: boolean;
                iso: string;
            };
            text: {
                autoCorrected: boolean;
                value: string;
                didYouMean: boolean;
            };
        };
        raw: unknown;
    }

    export function translate(
        text: string | string[],
        options?: TranslateOptions
    ): Promise<TranslateResult>;
}

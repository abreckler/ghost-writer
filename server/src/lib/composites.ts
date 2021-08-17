import {
  HealthyTechParaphraserApiClient,
  SmodinRewriterApiClient,
  TextAnalysisTextSummarizationApiClient,
  TextMonkeySummarizerApiClient,
} from './rapidapi';

const RAPIDAPI_API_KEY = process.env.RAPIDAPI_API_KEY || '';

const paraphraser = async (
  text: string,
  options: { lang?: string; strength?: number } | null = null,
  apiName: 'smodin' | 'healthytech' = 'healthytech',
): Promise<string | null> => {
  switch (apiName) {
    case 'healthytech':
      try {
        const rephraserClient = new HealthyTechParaphraserApiClient(RAPIDAPI_API_KEY);
        const rephraserRespone = await rephraserClient.rewrite(text);
        if (rephraserRespone.newText) {
          return rephraserRespone.newText;
        } else {
          console.debug('Rephrasing API returned invalid response, skip further processing.', text);
          return null;
        }
      } catch (e) {
        console.error('RapidAPI - Rephraser API Failure: ', e);
        return null;
      }
    case 'smodin':
      try {
        const rephraserClient = new SmodinRewriterApiClient(RAPIDAPI_API_KEY);
        const rephraserRespone = await rephraserClient.rewrite(
          text,
          (options && options.lang) || 'en',
          (options && options.strength) || 3,
        );
        if (rephraserRespone.rewrite) {
          return rephraserRespone.rewrite;
        } else {
          console.debug(
            'Rewriter/Paraphraser/Text Changer API returned invalid response, skip further processing.',
            text,
          );
          return null;
        }
      } catch (e) {
        console.error('RapidAPI - Rephraser API Failure: ', e);
        return null;
      }
  }
};

const summarizerText = async (
  text: string,
  options: { sentnum?: number } | null = null,
  apiName: 'textanalysis' | 'text-monkey' = 'textanalysis',
): Promise<{ snippets?: Array<string>; summary?: string } | null> => {
  switch (apiName) {
    case 'textanalysis':
      try {
        const summarizerClient = new TextAnalysisTextSummarizationApiClient(RAPIDAPI_API_KEY);
        const summarizerResponse = await summarizerClient.textSummarizerText(text, options?.sentnum);
        if (summarizerResponse.sentences) {
          return { snippets: summarizerResponse.sentences };
        } else {
          console.debug(
            'Text Analysis - Text Summarization API returned invalid response, skip further processing.',
            text,
          );
          return null;
        }
      } catch (e) {
        console.error('RapidAPI - Summarizer API Failure: ', e);
        return null;
      }
    case 'text-monkey':
      try {
        const summarizerClient = new TextMonkeySummarizerApiClient(RAPIDAPI_API_KEY);
        const summarizerResponse = await summarizerClient.textSummarizerText(text);
        if (summarizerResponse.summary || summarizerResponse.snippets) {
          return {
            snippets: summarizerResponse.snippets,
            summary: summarizerResponse.summary,
          };
        } else {
          console.debug('Text Monkey - Summarizer API returned invalid response, skip further processing.', text);
          return null;
        }
      } catch (e) {
        console.error('RapidAPI - Summarizer API Failure: ', e);
        return null;
      }
  }
};

const summarizerUrl = async (
  url: string,
  options: { sentnum?: number } | null = null,
  apiName: 'textanalysis' | 'text-monkey' = 'textanalysis',
): Promise<{ snippets?: Array<string>; summary?: string } | null> => {
  switch (apiName) {
    case 'textanalysis':
      try {
        const summarizerClient = new TextAnalysisTextSummarizationApiClient(RAPIDAPI_API_KEY);
        const summarizerResponse = await summarizerClient.textSummarizerUrl(url, options?.sentnum);
        if (summarizerResponse.sentences) {
          return { snippets: summarizerResponse.sentences };
        } else {
          console.debug(
            'Text Analysis - URL Summarization API returned invalid response, skip further processing.',
            url,
          );
          return null;
        }
      } catch (e) {
        console.error('RapidAPI - Text Analysis URL Summarizer API Failure: ', e);
        return null;
      }
    case 'text-monkey':
      try {
        const summarizerClient = new TextMonkeySummarizerApiClient(RAPIDAPI_API_KEY);
        const summarizerResponse = await summarizerClient.textSummarizerUrl(url);
        if (summarizerResponse.summary || summarizerResponse.snippets) {
          return {
            snippets: summarizerResponse.snippets,
            summary: summarizerResponse.summary,
          };
        } else {
          console.debug('Text Monkey - URL Summarizer API returned invalid response, skip further processing.', url);
          return null;
        }
      } catch (e) {
        console.error('RapidAPI - Text Monkey Summarizer API Failure: ', e);
        return null;
      }
  }
};

export { paraphraser, summarizerText, summarizerUrl };
const fs = require('node:fs');
const path = require('node:path');

let cachedIndex = null;
let cachedAt = 0;

function getBaseUrl(req) {
  const proto = (req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = (req.headers.host || '').trim();
  if (!host) return '';
  return `${proto}://${host}`;
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(value) {
  const normalized = normalizeText(value);
  return normalized ? normalized.split(/\s+/).filter(Boolean) : [];
}

function firstExcerpt(text, tokens) {
  const source = String(text || '').replace(/\s+/g, ' ').trim();
  if (!source) return '';

  const lower = normalizeText(source);
  const hit = tokens.find((token) => token.length > 1 && lower.includes(token));
  if (!hit) return source.slice(0, 220);

  const index = lower.indexOf(hit);
  const start = Math.max(0, index - 90);
  const end = Math.min(source.length, index + 180);
  const excerpt = source.slice(start, end).trim();
  return start > 0 ? `...${excerpt}` : excerpt;
}

function scoreItem(item, queryTokens) {
  const title = normalizeText(item.title);
  const summary = normalizeText(item.summary);
  const content = normalizeText(item.content);
  const tags = Array.isArray(item.tags) ? item.tags.map((tag) => normalizeText(tag)) : [];
  let score = 0;

  queryTokens.forEach((token) => {
    if (title.includes(token)) score += 6;
    if (summary.includes(token)) score += 3;
    if (content.includes(token)) score += 1;
    if (tags.some((tag) => tag.includes(token))) score += 4;
  });

  const queryPhrase = normalizeText(queryTokens.join(' '));
  if (queryPhrase && title.includes(queryPhrase)) score += 10;
  if (queryPhrase && summary.includes(queryPhrase)) score += 5;

  return score;
}

async function loadIndex(baseUrl) {
  if (cachedIndex && Date.now() - cachedAt < 5 * 60 * 1000) {
    return cachedIndex;
  }

  const candidates = [];
  if (baseUrl) candidates.push(new URL('/index.json', baseUrl).toString());

  for (const url of candidates) {
    try {
      const response = await fetch(url, { headers: { accept: 'application/json' } });
      if (!response.ok) continue;
      const payload = await response.json();
      const items = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : [];
      cachedIndex = items;
      cachedAt = Date.now();
      return items;
    } catch (error) {
      // Try filesystem fallback below.
    }
  }

  const fallbackPaths = [
    path.join(process.cwd(), 'public', 'index.json'),
    path.join(process.cwd(), 'index.json'),
  ];

  for (const filePath of fallbackPaths) {
    try {
      if (!fs.existsSync(filePath)) continue;
      const raw = fs.readFileSync(filePath, 'utf8');
      const payload = JSON.parse(raw);
      const items = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : [];
      cachedIndex = items;
      cachedAt = Date.now();
      return items;
    } catch (error) {
      // Continue to the next fallback.
    }
  }

  cachedIndex = [];
  cachedAt = Date.now();
  return [];
}

function buildContextItems(items, queryTokens, topK) {
  return items
    .map((item) => ({
      ...item,
      _score: scoreItem(item, queryTokens),
    }))
    .filter((item) => item._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, topK)
    .map((item, index) => ({
      id: index + 1,
      title: item.title,
      url: item.url,
      section: item.section,
      tags: item.tags || [],
      summary: item.summary || '',
      excerpt: firstExcerpt(item.content || item.summary || '', queryTokens),
      score: item._score,
      readingTime: item.readingTime || null,
      date: item.date || null,
    }));
}

function parseCsv(value) {
  return String(value || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function uniqueNonEmpty(values) {
  const seen = new Set();
  const result = [];
  values.forEach((value) => {
    const normalized = String(value || '').trim();
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    result.push(normalized);
  });
  return result;
}

function getEnvList(...keys) {
  const values = [];
  keys.forEach((key) => {
    const raw = process.env[key];
    if (!raw) return;
    values.push(...parseCsv(raw));
  });
  return uniqueNonEmpty(values);
}

function normalizeProviderName(name) {
  return String(name || '').trim().toLowerCase();
}

function getProviderOrder(mode) {
  const raw = mode === 'chat'
    ? (process.env.AI_CHAT_PROVIDER_ORDER || process.env.AI_PROVIDER_ORDER || 'gemini,groq')
    : (process.env.AI_SEARCH_PROVIDER_ORDER || process.env.AI_PROVIDER_ORDER || 'gemini,groq');

  return uniqueNonEmpty(parseCsv(raw).map(normalizeProviderName))
    .filter((provider) => ['gemini', 'groq'].includes(provider));
}

function getProviderKeys(provider, mode) {
  if (provider === 'gemini') {
    if (mode === 'chat') {
      return getEnvList('GEMINI_CHAT_API_KEYS', 'GEMINI_CHAT_API_KEY', 'GEMINI_API_KEYS', 'GEMINI_API_KEY');
    }
    return getEnvList('GEMINI_API_KEYS', 'GEMINI_API_KEY');
  }

  if (provider === 'groq') {
    return getEnvList('GROQ_API_KEYS', 'GROQ_API_KEY');
  }

  return [];
}

function getProviderModel(provider, mode) {
  if (provider === 'gemini') {
    return mode === 'chat'
      ? (process.env.GEMINI_CHAT_MODEL || 'gemini-2.5-flash')
      : (process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite');
  }

  if (provider === 'groq') {
    return mode === 'chat'
      ? (process.env.GROQ_CHAT_MODEL || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile')
      : (process.env.GROQ_SEARCH_MODEL || process.env.GROQ_MODEL || 'llama-3.3-70b-versatile');
  }

  return '';
}

function getPositiveIntEnv(keys, fallback, min = 128, max = 8192) {
  for (const key of keys) {
    const value = Number.parseInt(process.env[key], 10);
    if (Number.isInteger(value) && value >= min && value <= max) {
      return value;
    }
  }
  return fallback;
}

function parseJsonObjectFromText(text, fallbackMessage) {
  const raw = String(text || '').trim();
  if (!raw) {
    const error = new Error(fallbackMessage);
    error.statusCode = 502;
    throw error;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    // Try fenced code and loose JSON extraction.
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;
  const objectMatch = candidate.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    try {
      return JSON.parse(objectMatch[0]);
    } catch (error) {
      // Continue to final error.
    }
  }

  const err = new Error(fallbackMessage);
  err.statusCode = 502;
  throw err;
}

function parseGeminiJson(payload, fallbackMessage) {
  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '{}';
  return parseJsonObjectFromText(text, fallbackMessage);
}

function extractGroundingSources(payload) {
  const chunks = payload?.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];

  const seen = new Set();
  const sources = [];
  chunks.forEach((chunk) => {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || uri;
    if (!uri || seen.has(uri)) return;
    seen.add(uri);
    sources.push({ title, url: uri });
  });
  return sources;
}

function buildSearchPrompt(query, candidates) {
  return [
    'Bạn là trợ lý tìm kiếm nội dung của Quorix Viet Nam.',
    'Chỉ dùng các nguồn được cung cấp bên dưới. Không bịa link, không tạo nguồn mới.',
    'Trả lời rõ ràng, có chiều sâu vừa đủ (4-8 câu), bằng tiếng Việt.',
    'Nếu không đủ dữ liệu, hãy nói rõ là chưa đủ chắc chắn.',
    'Đầu ra PHẢI là JSON hợp lệ với các trường:',
    '{ "answer": string, "confidence": "high"|"medium"|"low", "matchedIds": number[], "followUps": string[] }',
    'matchedIds chỉ được chọn từ ID của các nguồn đã cung cấp.',
    '',
    `Câu hỏi của người dùng: ${query}`,
    '',
    'Nguồn:',
    ...candidates.map((item) => [
      `ID: ${item.id}`,
      `Title: ${item.title}`,
      `URL: ${item.url}`,
      `Section: ${item.section}`,
      `Tags: ${(item.tags || []).join(', ')}`,
      `Summary: ${item.summary}`,
      `Excerpt: ${item.excerpt}`,
      '',
    ].join('\n')),
  ].join('\n');
}

function buildChatSystemInstruction() {
  return [
    'Bạn là Quorix AI Chat.',
    'Bạn trò chuyện như Gemini/ChatGPT: tự nhiên, rõ ràng, ưu tiên tính chính xác.',
    'Nếu có phần chưa chắc chắn, nói rõ mức độ chắc chắn.',
    'Trả lời bằng tiếng Việt, trình bày dễ đọc.',
  ].join('\n');
}

function trimDuplicateLatestUserMessage(messages, query) {
  const history = Array.isArray(messages) ? messages.slice(-10) : [];
  if (!history.length) return history;

  const last = history[history.length - 1];
  if (last?.role !== 'user') return history;

  const lastContent = normalizeText(last?.content || '');
  const queryContent = normalizeText(query || '');
  if (!lastContent || !queryContent || lastContent !== queryContent) return history;

  return history.slice(0, -1);
}

function buildContinuationPrompt() {
  return [
    'Continue exactly from where you stopped.',
    'Do not repeat previous content.',
    'If you were inside a Markdown code block, continue and close it correctly.',
  ].join('\n');
}

function hasUnclosedCodeFence(text) {
  const matches = String(text || '').match(/```/g);
  return Boolean(matches && matches.length % 2 === 1);
}

function looksLikelyIncomplete(text) {
  const raw = String(text || '').trim();
  if (!raw) return false;
  if (hasUnclosedCodeFence(raw)) return true;
  if (/[,:;(\[{<'"`]\s*$/.test(raw)) return true;
  if (/[A-Za-z0-9\u00C0-\u1EF9]$/.test(raw) && !/[.!?]\s*$/.test(raw)) {
    return raw.length > 120;
  }
  return false;
}

function isTokenLimitFinishReason(reason) {
  const value = String(reason || '').toUpperCase();
  return value === 'MAX_TOKENS' || value === 'LENGTH';
}

function appendUniqueWebSources(base, payload) {
  const merged = Array.isArray(base) ? [...base] : [];
  const known = new Set(merged.map((item) => item?.url).filter(Boolean));
  extractGroundingSources(payload).forEach((source) => {
    if (!source?.url || known.has(source.url)) return;
    known.add(source.url);
    merged.push(source);
  });
  return merged;
}

function normalizeTextCompletion(payload, fallbackMessage) {
  const answer = String(payload || '').trim();
  if (answer) return answer;
  const error = new Error(fallbackMessage);
  error.statusCode = 502;
  throw error;
}

function extractGroqText(payload, fallbackMessage) {
  const text = payload?.choices?.[0]?.message?.content;
  return normalizeTextCompletion(text, fallbackMessage);
}

async function callGeminiSearch({ query, candidates, apiKey, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const prompt = buildSearchPrompt(query, candidates);
  const maxOutputTokens = getPositiveIntEnv(['GEMINI_SEARCH_MAX_OUTPUT_TOKENS', 'GEMINI_MAX_OUTPUT_TOKENS'], 1200, 256, 4096);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.42,
        maxOutputTokens,
      },
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message || 'Gemini API trả về lỗi.';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  return parseGeminiJson(payload, 'Gemini không trả về JSON hợp lệ.');
}

async function callGeminiChat({ query, messages, apiKey, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const history = trimDuplicateLatestUserMessage(messages, query);
  const maxOutputTokens = getPositiveIntEnv(['GEMINI_CHAT_MAX_OUTPUT_TOKENS', 'GEMINI_MAX_OUTPUT_TOKENS'], 2200, 256, 8192);
  const maxContinuationRounds = getPositiveIntEnv(['AI_CHAT_CONTINUE_STEPS'], 2, 1, 4);

  const contents = [];
  history.forEach((message) => {
    const text = String(message?.content || '').trim();
    if (!text) return;
    contents.push({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text }],
    });
  });

  contents.push({
    role: 'user',
    parts: [{ text: query }],
  });

  const chunks = [];
  let webSources = [];
  let finishReason = '';
  let continuationRounds = 0;

  for (let round = 0; round <= maxContinuationRounds; round += 1) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildChatSystemInstruction() }],
        },
        contents,
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.55,
          maxOutputTokens,
        },
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message || 'Gemini Chat API returned an error.';
      const error = new Error(message);
      error.statusCode = response.status;
      throw error;
    }

    const candidate = payload?.candidates?.[0];
    const chunk = candidate?.content?.parts?.map((part) => part.text || '').join('').trim();
    if (!chunk) {
      const error = new Error('Gemini Chat did not return valid content.');
      error.statusCode = 502;
      throw error;
    }

    chunks.push(chunk);
    webSources = appendUniqueWebSources(webSources, payload);
    finishReason = String(candidate?.finishReason || '');

    const combined = chunks.join('\n').trim();
    const shouldContinue = (isTokenLimitFinishReason(finishReason) || looksLikelyIncomplete(combined))
      && round < maxContinuationRounds;
    if (!shouldContinue) break;

    continuationRounds += 1;
    contents.push({ role: 'model', parts: [{ text: chunk }] });
    contents.push({ role: 'user', parts: [{ text: buildContinuationPrompt() }] });
  }

  const answer = chunks.join('\n').trim();
  const truncatedLikely = isTokenLimitFinishReason(finishReason) || looksLikelyIncomplete(answer);

  return {
    answer,
    confidence: 'medium',
    matchedIds: [],
    followUps: [],
    webSources,
    meta: {
      finishReason,
      continuationRounds,
      truncatedLikely,
    },
  };
}

async function callGroqSearch({ query, candidates, apiKey, model }) {
  const prompt = buildSearchPrompt(query, candidates);
  const maxTokens = getPositiveIntEnv(['GROQ_SEARCH_MAX_TOKENS', 'GROQ_MAX_TOKENS'], 1200, 256, 8192);
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'Bạn là trợ lý AI. Luôn trả về JSON hợp lệ, không thêm văn bản ngoài JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.35,
      max_tokens: maxTokens,
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload?.error?.message || 'Groq API trả về lỗi.';
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const text = extractGroqText(payload, 'Groq không trả về nội dung hợp lệ.');
  return parseJsonObjectFromText(text, 'Groq không trả về JSON hợp lệ.');
}

async function callGroqChat({ query, messages, apiKey, model }) {
  const history = trimDuplicateLatestUserMessage(messages, query);
  const maxTokens = getPositiveIntEnv(['GROQ_CHAT_MAX_TOKENS', 'GROQ_MAX_TOKENS'], 2200, 256, 8192);
  const maxContinuationRounds = getPositiveIntEnv(['AI_CHAT_CONTINUE_STEPS'], 2, 1, 4);

  const chatMessages = [
    {
      role: 'system',
      content: buildChatSystemInstruction(),
    },
    ...history
      .filter((message) => String(message?.content || '').trim())
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: String(message.content).trim(),
      })),
    {
      role: 'user',
      content: query,
    },
  ];

  const chunks = [];
  let finishReason = '';
  let continuationRounds = 0;

  for (let round = 0; round <= maxContinuationRounds; round += 1) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature: 0.6,
        max_tokens: maxTokens,
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message || 'Groq Chat API returned an error.';
      const error = new Error(message);
      error.statusCode = response.status;
      throw error;
    }

    const chunk = extractGroqText(payload, 'Groq Chat did not return valid content.');
    finishReason = String(payload?.choices?.[0]?.finish_reason || '');
    chunks.push(chunk);

    const combined = chunks.join('\n').trim();
    const shouldContinue = (isTokenLimitFinishReason(finishReason) || looksLikelyIncomplete(combined))
      && round < maxContinuationRounds;
    if (!shouldContinue) break;

    continuationRounds += 1;
    chatMessages.push({ role: 'assistant', content: chunk });
    chatMessages.push({ role: 'user', content: buildContinuationPrompt() });
  }

  const answer = chunks.join('\n').trim();
  const truncatedLikely = isTokenLimitFinishReason(finishReason) || looksLikelyIncomplete(answer);

  return {
    answer,
    confidence: 'medium',
    matchedIds: [],
    followUps: [],
    webSources: [],
    meta: {
      finishReason,
      continuationRounds,
      truncatedLikely,
    },
  };
}

async function callWithProviderRotation({ mode, query, candidates, messages }) {
  const providerOrder = getProviderOrder(mode);
  const attempts = [];

  for (const provider of providerOrder) {
    const model = getProviderModel(provider, mode);
    const keys = getProviderKeys(provider, mode);

    if (!model) {
      attempts.push({ provider, reason: 'missing_model' });
      continue;
    }

    if (!keys.length) {
      attempts.push({ provider, reason: 'missing_key' });
      continue;
    }

    for (let index = 0; index < keys.length; index += 1) {
      const apiKey = keys[index];
      try {
        let result;
        if (provider === 'gemini') {
          result = mode === 'chat'
            ? await callGeminiChat({ query, messages, apiKey, model })
            : await callGeminiSearch({ query, candidates, apiKey, model });
        } else {
          result = mode === 'chat'
            ? await callGroqChat({ query, messages, apiKey, model })
            : await callGroqSearch({ query, candidates, apiKey, model });
        }

        return {
          result,
          provider,
          model,
          attempts,
        };
      } catch (error) {
        attempts.push({
          provider,
          model,
          keyIndex: index + 1,
          statusCode: Number(error?.statusCode || 0),
          message: String(error?.message || 'Unknown provider error'),
        });
      }
    }
  }

  const error = new Error('Tất cả provider AI hiện đều không khả dụng hoặc đã hết quota.');
  error.statusCode = 503;
  error.providerOrder = providerOrder;
  error.attempts = attempts;
  throw error;
}

function buildProviderNotice(error, mode) {
  const attempts = Array.isArray(error?.attempts) ? error.attempts : [];
  const statuses = attempts.map((item) => Number(item.statusCode || 0)).filter((code) => code > 0);
  const messages = attempts.map((item) => String(item.message || '').toLowerCase());

  const hasMissingModel = attempts.some((item) => item.reason === 'missing_model');
  const hasMissingKey = attempts.some((item) => item.reason === 'missing_key');
  const hasQuota = statuses.includes(429) || messages.some((message) => /(quota|rate limit|resource exhausted|too many requests)/i.test(message));
  const hasModelAccessIssue = statuses.includes(403) || statuses.includes(404) || messages.some((message) => /(not found|permission denied|not enabled|not available|unsupported|disabled|model.*unavailable)/i.test(message));

  if (hasMissingKey) {
    return {
      type: 'config',
      title: 'Thiếu API key provider',
      message: 'Bạn chưa cấu hình đủ API key cho các provider trong thứ tự xoay vòng. Hãy thêm key cho Gemini/Groq để fallback hoạt động.',
    };
  }

  if (hasMissingModel) {
    return {
      type: 'config',
      title: 'Thiếu model provider',
      message: 'Một hoặc nhiều provider chưa có model cấu hình. Hãy set GEMINI_MODEL, GEMINI_CHAT_MODEL, GROQ_MODEL (hoặc GROQ_CHAT_MODEL/GROQ_SEARCH_MODEL).',
    };
  }

  if (hasQuota) {
    return {
      type: 'quota',
      title: 'Các provider đang chạm quota',
      message: 'Nhiều provider đang bị giới hạn quota/rate-limit. Hãy thử lại sau ít phút hoặc thêm key dự phòng để hệ thống xoay vòng tốt hơn.',
    };
  }

  if (hasModelAccessIssue) {
    return {
      type: 'model',
      title: 'Model chưa khả dụng',
      message: 'Một số model chưa được bật hoặc không khả dụng cho API key hiện tại. Hãy kiểm tra model name và quyền truy cập của từng provider.',
    };
  }

  return {
    type: 'error',
    title: mode === 'chat' ? 'Chat AI tạm thời không phản hồi' : 'AI Search tạm thời không phản hồi',
    message: String(error?.message || 'Hệ thống AI đang gặp lỗi tạm thời.'),
  };
}

function createFallbackResponse(query, candidates) {
  const top = candidates.slice(0, 3);
  return {
    answer: top.length
      ? `Mình tìm thấy ${top.length} nguồn gần nhất cho "${query}". Bạn có thể mở các bài bên dưới để đọc chi tiết.`
      : `Mình chưa tìm thấy nguồn thật sự khớp với "${query}". Hãy thử đổi cách diễn đạt hoặc quay lại Posts để browse.`,
    confidence: top.length ? 'medium' : 'low',
    matchedIds: top.map((item) => item.id),
    followUps: top.length
      ? [
        'Tóm tắt nhanh hơn',
        'Cho tôi ví dụ thực tế',
        'Bài liên quan khác',
      ]
      : [
        'Tìm theo từ khóa gần đúng',
        'Chỉ bài về Go',
        'Chỉ bài về network',
      ],
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const baseUrl = getBaseUrl(req);
    const mode = String(req.method === 'GET' ? req.query.mode || 'search' : req.body?.mode || 'search').toLowerCase();
    const messages = req.method === 'GET'
      ? []
      : Array.isArray(req.body?.messages)
        ? req.body.messages
        : [];
    const query = req.method === 'GET'
      ? String(req.query.q || '').trim()
      : String((req.body && req.body.query) || '').trim();
    const topK = Math.min(Math.max(Number(req.method === 'GET' ? req.query.topK : req.body?.topK) || 5, 3), 7);

    if (!query) {
      res.status(400).json({ error: 'Vui lòng nhập câu hỏi tìm kiếm.' });
      return;
    }

    if (query.length < 2 || query.length > 180) {
      res.status(400).json({ error: 'Câu hỏi phải dài từ 2 đến 180 ký tự.' });
      return;
    }

    const index = mode === 'chat' ? [] : await loadIndex(baseUrl);
    const queryTokens = tokenize(query);
    const candidates = mode === 'chat' ? [] : buildContextItems(index, queryTokens, topK);

    if (mode !== 'chat' && candidates.length === 0) {
      const fallback = createFallbackResponse(query, []);
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({
        ...fallback,
        query,
        citations: [],
        matchedCount: 0,
      });
      return;
    }

    let aiResult;
    let providerMeta = null;
    let providerAttempts = [];

    try {
      const routed = await callWithProviderRotation({ mode, query, candidates, messages });
      aiResult = routed.result;
      providerMeta = { provider: routed.provider, model: routed.model };
      providerAttempts = routed.attempts;
    } catch (error) {
      const notice = buildProviderNotice(error, mode);
      providerAttempts = Array.isArray(error?.attempts) ? error.attempts : [];
      aiResult = mode === 'chat'
        ? {
            answer: notice.message,
            confidence: 'low',
            matchedIds: [],
            followUps: [],
            notice,
            error: error.message,
            webSources: [],
          }
        : createFallbackResponse(query, candidates);
      if (mode !== 'chat') {
        aiResult.error = error.message;
        aiResult.notice = notice;
      }
    }

    const matchedIds = Array.isArray(aiResult.matchedIds)
      ? aiResult.matchedIds.filter((value) => Number.isInteger(value))
      : candidates.slice(0, 3).map((item) => item.id);

    const matchedSet = new Set(matchedIds);
    const citations = candidates
      .filter((item) => matchedSet.size === 0 || matchedSet.has(item.id))
      .map((item) => ({
        title: item.title,
        url: item.url,
        reason: `Phù hợp với truy vấn "${query}"`,
        excerpt: item.excerpt,
        section: item.section,
        tags: item.tags,
        readingTime: item.readingTime,
        date: item.date,
      }));

    if (citations.length === 0) {
      citations.push(...candidates.slice(0, 3).map((item) => ({
        title: item.title,
        url: item.url,
        reason: `Nguồn gần nhất cho "${query}"`,
        excerpt: item.excerpt,
        section: item.section,
        tags: item.tags,
        readingTime: item.readingTime,
        date: item.date,
      })));
    }

    if (mode === 'chat' && Array.isArray(aiResult.webSources) && aiResult.webSources.length) {
      const known = new Set(citations.map((item) => item.url));
      aiResult.webSources.forEach((source) => {
        if (!source?.url || known.has(source.url)) return;
        known.add(source.url);
        citations.unshift({
          title: source.title || source.url,
          url: source.url,
          reason: 'Nguồn Internet live từ Gemini grounding',
          excerpt: '',
          section: 'Web',
          tags: [],
          readingTime: null,
          date: null,
        });
      });
    }

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      query,
      mode,
      answer: aiResult.answer || '',
      confidence: aiResult.confidence || 'medium',
      citations,
      matchedIds,
      matchedCount: citations.length,
      followUps: Array.isArray(aiResult.followUps) ? aiResult.followUps.slice(0, 5) : [],
      notice: aiResult.notice || null,
      provider: providerMeta?.provider || null,
      model: providerMeta?.model || null,
      generationMeta: aiResult.meta || null,
      attempts: providerAttempts,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Search failed.',
    });
  }
};

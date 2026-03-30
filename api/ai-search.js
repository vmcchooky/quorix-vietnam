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

async function callGemini({ query, candidates }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('Thiếu GEMINI_API_KEY trong biến môi trường.');
    error.statusCode = 500;
    throw error;
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const prompt = [
    'Bạn là trợ lý tìm kiếm nội dung của Quorix Viet Nam.',
    'Chỉ dùng các nguồn được cung cấp bên dưới. Không bịa link, không tạo nguồn mới.',
    'Trả lời ngắn gọn, rõ ràng, bằng tiếng Việt.',
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
        temperature: 0.35,
        maxOutputTokens: 800,
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

  const text = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || '{}';
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    const match = text.match(/\{[\s\S]*\}/);
    parsed = match ? JSON.parse(match[0]) : null;
  }

  if (!parsed || typeof parsed !== 'object') {
    const error = new Error('Gemini không trả về JSON hợp lệ.');
    error.statusCode = 502;
    throw error;
  }

  return parsed;
}

function buildGeminiNotice(error, model) {
  const message = String(error?.message || '');
  const lower = message.toLowerCase();
  const statusCode = Number(error?.statusCode || 0);
  const modelLabel = `\`${model}\``;

  if (
    statusCode === 404 ||
    statusCode === 403 ||
    /(not found|permission denied|not enabled|not available|unsupported|disabled|not activated|could not find|model.*unavailable|model.*disabled|resource.*not found)/i.test(lower)
  ) {
    return {
      type: 'model',
      title: 'Gemini model chưa khả dụng',
      message: `Model ${modelLabel} chưa được bật cho project/API key hiện tại hoặc chưa khả dụng trong khu vực này. Hãy kiểm tra quyền truy cập trong Google AI Studio / Vertex AI, hoặc đổi \`GEMINI_MODEL\` sang một model đang hoạt động rồi deploy lại.`,
    };
  }

  if (statusCode === 429 || /(quota|rate limit|too many requests|resource exhausted)/i.test(lower)) {
    return {
      type: 'quota',
      title: 'Gemini đang bị giới hạn quota',
      message: 'Yêu cầu đã chạm quota hoặc rate limit của Gemini. Hãy thử lại sau ít phút, hoặc tăng quota trong Google Cloud nếu cần.',
    };
  }

  return {
    type: 'error',
    title: 'Gemini tạm thời không phản hồi',
    message: message || 'Gemini đang gặp lỗi tạm thời. Hệ thống đã tự chuyển sang chế độ fallback từ nội dung site.',
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

    const index = await loadIndex(baseUrl);
    const queryTokens = tokenize(query);
    const candidates = buildContextItems(index, queryTokens, topK);

    if (candidates.length === 0) {
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
    try {
      aiResult = await callGemini({ query, candidates });
    } catch (error) {
      aiResult = createFallbackResponse(query, candidates);
      aiResult.error = error.message;
      aiResult.notice = buildGeminiNotice(error, process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview');
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

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      query,
      answer: aiResult.answer || '',
      confidence: aiResult.confidence || 'medium',
      citations,
      matchedIds,
      matchedCount: citations.length,
      followUps: Array.isArray(aiResult.followUps) ? aiResult.followUps.slice(0, 5) : [],
      notice: aiResult.notice || null,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      error: error.message || 'Search failed.',
    });
  }
};

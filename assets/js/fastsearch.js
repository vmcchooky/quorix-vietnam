import * as params from '@params';

const root = document.querySelector('.qx-ai-search');
const FuseCtor = window.Fuse || globalThis.Fuse;

if (root) {
    const els = {
        form: document.getElementById('qx-search-form'),
        input: document.getElementById('searchInput'),
        status: document.getElementById('searchStatus'),
        count: document.getElementById('searchResultCount'),
        quickChipBar: document.getElementById('qx-quick-chips'),
        resultsWrap: document.getElementById('qx-fast-wrap'),
        results: document.getElementById('qx-search-results'),
        quickQueries: Array.from(document.querySelectorAll('[data-search-query]')),
        aiButton: document.getElementById('aiSearchBtn'),
        aiPanel: document.getElementById('ai-panel'),
        aiAnswer: document.getElementById('aiAnswer'),
        aiLoadingBadge: document.getElementById('aiLoadingBadge'),
        aiConfidence: document.getElementById('aiConfidenceBadge'),
        aiProvider: document.getElementById('aiProviderBadge'),
        aiFollowups: document.getElementById('aiFollowups'),
        aiCitations: document.getElementById('aiCitations'),
        openChatButton: document.getElementById('openChatBtn'),
        stage: document.getElementById('qx-stage'),
        browseShell: document.getElementById('qx-browse-shell'),
        chatShell: document.getElementById('chatShell'),
        chatBackButton: document.getElementById('chatBackBtn'),
        chatThread: document.getElementById('chatThread'),
        chatForm: document.getElementById('chatForm'),
        chatInput: document.getElementById('chatInput'),
        chatSend: document.getElementById('chatSendBtn'),
        chatContext: document.getElementById('chatContext'),
    };

    const state = {
        fuse: null,
        indexItems: [],
        resultLinks: [],
        activeResultIndex: -1,
        lastSearchQuery: '',
        lastAiPayload: null,
        chatMessages: [],
        chatSeedKey: '',
        aiBusy: false,
        chatBusy: false,
        aiRequestId: 0,
    };

    const apiUrl = root.dataset.apiUrl || '/api/ai-search';
    const indexUrl = root.dataset.indexUrl || '/index.json';
    const defaultStatus = '';
    const confidenceMeta = {
        high: { className: 'qx-confidence qx-confidence-high', label: 'Tin cậy cao' },
        medium: { className: 'qx-confidence qx-confidence-medium', label: 'Tin cậy vừa' },
        low: { className: 'qx-confidence qx-confidence-low', label: 'Tin cậy thấp' },
    };

    init();

    function init() {
        bindEvents();
        setStatus('Đang tải chỉ mục tìm kiếm...');
        setCount('');
        updateChatComposerState();
        autoResizeTextarea();
        loadIndex();
    }

    function bindEvents() {
        if (els.form) {
            els.form.addEventListener('submit', function (event) {
                event.preventDefault();
                submitFastSearch();
            });
        }

        if (els.input) {
            els.input.addEventListener('input', function () {
                if (String(this.value || '').trim() !== state.lastSearchQuery) {
                    clearAiArtifacts();
                }
                renderResults(this.value);
            });

            els.input.addEventListener('search', function () {
                if (!this.value) resetBrowseState();
            });
        }

        els.quickQueries.forEach(function (button) {
            button.addEventListener('click', function () {
                const query = String(this.getAttribute('data-search-query') || '').trim();
                if (!query || !els.input) return;
                els.input.value = query;
                if (query !== state.lastSearchQuery) {
                    clearAiArtifacts();
                }
                renderResults(query);
                els.input.focus();
            });
        });

        if (els.openChatButton) {
            els.openChatButton.addEventListener('click', function () {
                openChatShell();
            });
        }

        if (els.chatBackButton) {
            els.chatBackButton.addEventListener('click', function () {
                closeChatShell();
            });
        }

        if (els.chatForm) {
            els.chatForm.addEventListener('submit', function (event) {
                event.preventDefault();
                submitChatMessage();
            });
        }

        if (els.chatInput) {
            els.chatInput.addEventListener('input', function () {
                autoResizeTextarea();
            });

            els.chatInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submitChatMessage();
                }
            });
        }

        document.addEventListener('keydown', handleGlobalKeys);
    }

    async function loadIndex() {
        if (!FuseCtor) {
            setStatus('Không tải được thư viện tìm kiếm trên trang này.');
            return;
        }

        try {
            const response = await fetch(indexUrl, {
                headers: { accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error(`Index request failed: ${response.status}`);
            }

            const payload = await response.json();
            const items = Array.isArray(payload)
                ? payload
                : Array.isArray(payload.items)
                    ? payload.items
                    : [];

            state.indexItems = items;
            state.fuse = new FuseCtor(items, buildFuseOptions());
            setStatus(defaultStatus);

            const presetQuery = new URLSearchParams(window.location.search).get('q');
            if (presetQuery && els.input) {
                els.input.value = presetQuery;
                renderResults(presetQuery);
            }
        } catch (error) {
            setStatus('Không thể tải dữ liệu tìm kiếm lúc này. Vui lòng thử lại sau.');
        }
    }

    function buildFuseOptions() {
        if (!params.fuseOpts) {
            return {
                distance: 100,
                threshold: 0.34,
                ignoreLocation: true,
                shouldSort: true,
                minMatchCharLength: 2,
                keys: ['title', 'summary', 'content', 'tags', 'section'],
            };
        }

        return {
            isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
            includeScore: params.fuseOpts.includescore ?? false,
            includeMatches: params.fuseOpts.includematches ?? false,
            minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 2,
            shouldSort: params.fuseOpts.shouldsort ?? true,
            findAllMatches: params.fuseOpts.findallmatches ?? false,
            keys: params.fuseOpts.keys ?? ['title', 'summary', 'content', 'tags', 'section'],
            location: params.fuseOpts.location ?? 0,
            threshold: params.fuseOpts.threshold ?? 0.34,
            distance: params.fuseOpts.distance ?? 100,
            ignoreLocation: params.fuseOpts.ignorelocation ?? true,
        };
    }

    function submitFastSearch() {
        const query = getQueryFromInput();
        if (!query) {
            resetBrowseState();
            return;
        }

        if (state.aiBusy) return;

        renderResults(query);
        runAiSearch(query);
    }

    function resetBrowseState() {
        state.activeResultIndex = -1;
        state.resultLinks = [];
        if (els.results) els.results.innerHTML = '';
        if (els.resultsWrap) els.resultsWrap.hidden = true;
        toggleQuickChips(true);
        clearAiArtifacts(true);
        setCount('');
        setStatus(defaultStatus);
        syncQueryParam('');
    }

    function renderResults(rawQuery) {
        const query = String(rawQuery || '').trim();
        state.activeResultIndex = -1;
        state.resultLinks = [];

        if (!state.fuse) {
            setStatus('Đang tải chỉ mục tìm kiếm...');
            return;
        }

        if (!query) {
            resetBrowseState();
            return;
        }

        toggleQuickChips(false);
        syncQueryParam(query);

        const limit = Number(params.fuseOpts?.limit || 8);
        const results = state.fuse.search(query, { limit });

        if (!results.length) {
            if (els.resultsWrap) els.resultsWrap.hidden = false;
            if (els.results) {
                els.results.innerHTML = [
                    '<article class="qx-fast-card" role="listitem">',
                    '<p class="qx-text-muted">Chưa có kết quả phù hợp</p>',
                    '<h3>Thử cụm từ khác hoặc đổi góc tiếp cận</h3>',
                    '<p class="qx-fast-summary">Bạn có thể đổi từ khóa kỹ thuật sang ngữ cảnh cụ thể hơn, ví dụ từ "security" sang "AES mode" hoặc "OSPF area".</p>',
                    '</article>',
                ].join('');
            }
            setStatus('Không có kết quả nhanh phù hợp.');
            setCount(`0 kết quả cho "${query}"`);
            return;
        }

        if (els.resultsWrap) els.resultsWrap.hidden = false;
        if (els.results) {
            els.results.innerHTML = results.map(function (entry) {
                return buildResultCard(entry.item, query);
            }).join('');
        }

        state.resultLinks = Array.from(els.results?.querySelectorAll('[data-fast-link]') || []);
        setStatus('Kết quả nhanh đã sẵn sàng.');
        setCount(`${results.length} kết quả gần nhất cho "${query}"`);
    }

    function buildResultCard(item, query) {
        const title = highlightMatches(item.title || 'Untitled', query);
        const summary = highlightMatches(buildSnippet(item), query);
        const section = escapeHtml(item.section || 'Nội dung');
        const readingTime = item.readingTime ? `<span class="qx-text-muted">${escapeHtml(item.readingTime)} phút đọc</span>` : '';
        const tagMarkup = Array.isArray(item.tags)
            ? item.tags.slice(0, 3).map(function (tag) {
                return `<span class="qx-badge-soft-blue">${escapeHtml(tag)}</span>`;
            }).join('')
            : '';

        return [
            '<article class="qx-fast-card" role="listitem">',
            '<div class="qx-d-flex qx-flex-wrap qx-gap-2 qx-items-center">',
            `<span class="qx-badge-soft-green">${section}</span>`,
            readingTime,
            '</div>',
            `<h3><a data-fast-link href="${escapeAttribute(item.permalink || item.url || '#')}" aria-label="${escapeAttribute(item.title || 'Kết quả tìm kiếm')}">${title}</a></h3>`,
            `<p class="qx-fast-summary">${summary}</p>`,
            tagMarkup ? `<div class="qx-d-flex qx-flex-wrap qx-gap-2">${tagMarkup}</div>` : '',
            '</article>',
        ].join('');
    }

    function buildSnippet(item) {
        const raw = String(item.summary || item.description || item.content || '').replace(/\s+/g, ' ').trim();
        if (!raw) return 'Mở nội dung để xem chi tiết.';
        return raw.slice(0, 180) + (raw.length > 180 ? '...' : '');
    }

    function highlightMatches(text, query) {
        const safe = escapeHtml(text);
        const tokens = tokenizeQuery(query);
        if (!tokens.length) return safe;

        const pattern = tokens
            .filter(function (token) { return token.length > 1; })
            .map(escapeRegex)
            .join('|');

        if (!pattern) return safe;

        const matcher = new RegExp(`(${pattern})`, 'gi');
        return safe.replace(matcher, '<mark>$1</mark>');
    }

    function tokenizeQuery(query) {
        return String(query || '')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 6);
    }

    async function runAiSearch(rawQuery) {
        const query = String(rawQuery || '').trim();
        if (!validateQuery(query, els.input)) return;
        const requestId = state.aiRequestId + 1;
        state.aiRequestId = requestId;

        if (els.input && els.input.value.trim() !== query) {
            els.input.value = query;
        }

        state.lastSearchQuery = query;
        state.lastAiPayload = null;
        setAiLoading(query);
        setAiBusy(true);

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    mode: 'search',
                    topK: 5,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || `AI search failed with status ${response.status}`);
            }
            if (requestId !== state.aiRequestId) return;

            renderAiPayload(data);
        } catch (error) {
            if (requestId !== state.aiRequestId) return;
            renderAiError(error.message || 'AI search tạm thời không phản hồi.');
        } finally {
            if (requestId === state.aiRequestId) {
                setAiBusy(false);
            }
        }
    }

    function setAiLoading(query) {
        if (els.aiPanel) els.aiPanel.hidden = false;
        if (els.aiAnswer) els.aiAnswer.innerHTML = `<p>Quorix AI đang tổng hợp câu trả lời cho "${escapeHtml(query)}"...<\/p>`;
        if (els.aiLoadingBadge) {
            els.aiLoadingBadge.hidden = false;
        }
        if (els.aiConfidence) {
            els.aiConfidence.hidden = true;
            els.aiConfidence.className = 'qx-confidence';
            els.aiConfidence.textContent = '';
        }
        if (els.aiProvider) {
            els.aiProvider.textContent = 'Đang truy vấn nguồn phù hợp';
        }
        if (els.aiFollowups) {
            els.aiFollowups.hidden = true;
            els.aiFollowups.innerHTML = '';
        }
        if (els.aiCitations) {
            els.aiCitations.hidden = true;
            els.aiCitations.innerHTML = '';
        }
        if (els.openChatButton) {
            els.openChatButton.hidden = true;
        }
    }

    function setAiBusy(isBusy) {
        state.aiBusy = isBusy;
        if (els.aiButton) {
            els.aiButton.toggleAttribute('disabled', isBusy);
            els.aiButton.setAttribute('aria-busy', isBusy ? 'true' : 'false');
        }
    }

    function clearAiArtifacts(resetSearchContext = false) {
        state.aiRequestId += 1;
        state.lastAiPayload = null;
        if (resetSearchContext) {
            state.lastSearchQuery = '';
            state.chatSeedKey = '';
        }
        setAiBusy(false);
        if (els.aiPanel) {
            els.aiPanel.hidden = true;
        }
        if (els.aiAnswer) {
            els.aiAnswer.innerHTML = '';
        }
        if (els.aiLoadingBadge) {
            els.aiLoadingBadge.hidden = true;
        }
        if (els.aiConfidence) {
            els.aiConfidence.hidden = true;
            els.aiConfidence.className = 'qx-confidence';
            els.aiConfidence.textContent = '';
        }
        if (els.aiProvider) {
            els.aiProvider.textContent = '';
        }
        if (els.aiFollowups) {
            els.aiFollowups.hidden = true;
            els.aiFollowups.innerHTML = '';
        }
        if (els.aiCitations) {
            els.aiCitations.hidden = true;
            els.aiCitations.innerHTML = '';
        }
        if (els.openChatButton) {
            els.openChatButton.hidden = true;
        }
    }

    function renderAiPayload(data) {
        state.lastAiPayload = data;
        state.lastSearchQuery = String(data?.query || state.lastSearchQuery || getQueryFromInput()).trim();

        if (els.aiPanel) els.aiPanel.hidden = false;
        if (els.aiAnswer) {
            els.aiAnswer.innerHTML = renderRichText(buildAiBody(data));
        }
        if (els.aiLoadingBadge) {
            els.aiLoadingBadge.hidden = true;
        }

        renderConfidence(data?.confidence);
        renderProviderBadge(data);
        renderFollowupChips(Array.isArray(data?.followUps) ? data.followUps.slice(0, 4) : []);
        renderCitations(Array.isArray(data?.citations) ? data.citations : []);

        if (els.openChatButton) {
            const hasAnswer = String(data?.answer || '').trim().length > 0;
            els.openChatButton.hidden = !hasAnswer;
        }
    }

    function buildAiBody(data) {
        const answer = String(data?.answer || '').trim();
        const noticeTitle = String(data?.notice?.title || '').trim();
        const noticeMessage = String(data?.notice?.message || '').trim();

        if (noticeMessage && noticeMessage !== answer) {
            return `${noticeTitle ? `**${noticeTitle}**\n\n` : ''}${answer || noticeMessage}`;
        }

        return answer || 'Chưa có câu trả lời phù hợp từ AI.';
    }

    function renderConfidence(level) {
        if (!els.aiConfidence) return;
        const meta = confidenceMeta[level] || confidenceMeta.medium;
        els.aiConfidence.className = meta.className;
        els.aiConfidence.textContent = meta.label;
        els.aiConfidence.hidden = false;
    }

    function renderProviderBadge(data) {
        if (!els.aiProvider) return;

        const provider = String(data?.provider || '').trim();
        const model = String(data?.model || '').trim();
        const providerLabel = provider
            ? `${capitalize(provider)}${model ? ` · ${model}` : ''}`
            : 'Dữ liệu nội bộ Quorix';

        els.aiProvider.textContent = providerLabel;
    }

    function renderFollowupChips(questions) {
        if (!els.aiFollowups) return;

        if (!questions.length) {
            els.aiFollowups.hidden = true;
            els.aiFollowups.innerHTML = '';
            return;
        }

        els.aiFollowups.hidden = false;
        els.aiFollowups.innerHTML = questions.map(function (question) {
            const safe = escapeHtml(question);
            return `<button class="qx-ai-follow-chip" type="button" data-ai-followup="${escapeAttribute(question)}">${safe}</button>`;
        }).join('');

        Array.from(els.aiFollowups.querySelectorAll('[data-ai-followup]')).forEach(function (button) {
            button.addEventListener('click', function () {
                const question = String(this.getAttribute('data-ai-followup') || '').trim();
                if (!question || !els.input) return;
                els.input.value = question;
                renderResults(question);
                runAiSearch(question);
            });
        });
    }

    function renderCitations(citations) {
        if (!els.aiCitations) return;

        if (!citations.length) {
            els.aiCitations.hidden = true;
            els.aiCitations.innerHTML = '';
            return;
        }

        els.aiCitations.hidden = false;
        els.aiCitations.innerHTML = citations.slice(0, 5).map(function (citation) {
            const title = escapeHtml(citation.title || 'Nguồn tham khảo');
            const url = escapeAttribute(citation.url || '#');
            const reason = escapeHtml(citation.reason || citation.section || 'Nguồn liên quan');
            const excerpt = escapeHtml(String(citation.excerpt || '').trim());
            const readingTime = citation.readingTime ? `<span class="qx-text-muted">${escapeHtml(citation.readingTime)} phút đọc</span>` : '';

            return [
                '<article class="qx-source-card">',
                '<div class="qx-d-flex qx-flex-wrap qx-gap-2 qx-items-center">',
                `<span class="qx-badge-soft-blue">${reason}</span>`,
                readingTime,
                '</div>',
                `<h3><a href="${url}">${title}</a></h3>`,
                excerpt ? `<p>${excerpt}</p>` : '',
                '</article>',
            ].join('');
        }).join('');
    }

    function renderAiError(message) {
        if (els.aiPanel) els.aiPanel.hidden = false;
        if (els.aiAnswer) {
            els.aiAnswer.innerHTML = `<p>${escapeHtml(message || 'AI search tạm thời không phản hồi.')}</p>`;
        }
        if (els.aiLoadingBadge) {
            els.aiLoadingBadge.hidden = true;
        }
        if (els.aiConfidence) {
            els.aiConfidence.className = confidenceMeta.low.className;
            els.aiConfidence.textContent = confidenceMeta.low.label;
            els.aiConfidence.hidden = false;
        }
        if (els.aiProvider) {
            els.aiProvider.textContent = '';
        }
        if (els.aiFollowups) {
            els.aiFollowups.hidden = true;
            els.aiFollowups.innerHTML = '';
        }
        if (els.aiCitations) {
            els.aiCitations.hidden = true;
            els.aiCitations.innerHTML = '';
        }
        if (els.openChatButton) {
            els.openChatButton.hidden = true;
        }
    }

    function openChatShell() {
        if (!els.chatShell || !els.stage) return;

        seedChatFromLatestAi();
        renderChatThread();
        setChatContext(
            state.lastSearchQuery
                ? `Đang đào sâu tiếp cho "${state.lastSearchQuery}".`
                : 'Đang trao đổi tiếp cùng Quorix AI.'
        );

        els.chatShell.hidden = false;
        els.stage.classList.add('is-chat');
        window.requestAnimationFrame(function () {
            els.chatShell.classList.add('is-visible');
        });

        if (els.chatInput) {
            els.chatInput.focus();
        }
    }

    function closeChatShell() {
        if (!els.chatShell || !els.stage) return;

        els.stage.classList.remove('is-chat');
        els.chatShell.classList.remove('is-visible');
        window.setTimeout(function () {
            if (!els.stage.classList.contains('is-chat')) {
                els.chatShell.hidden = true;
            }
        }, 220);

        if (els.input) {
            els.input.focus();
        }
    }

    function seedChatFromLatestAi() {
        const answer = String(state.lastAiPayload?.answer || '').trim();
        const query = String(state.lastSearchQuery || '').trim();
        const nextSeedKey = `${query}::${answer}`;

        if (!query || state.chatSeedKey === nextSeedKey) return;

        state.chatSeedKey = nextSeedKey;
        state.chatMessages = [{ role: 'user', content: query }];

        if (answer) {
            state.chatMessages.push({
                role: 'assistant',
                content: answer,
            });
        }
    }

    async function submitChatMessage() {
        const query = String(els.chatInput?.value || '').trim();
        if (!validateQuery(query, els.chatInput)) return;
        if (state.chatBusy) return;

        if (!els.chatInput) return;

        state.chatMessages.push({ role: 'user', content: query });
        state.lastSearchQuery = state.lastSearchQuery || query;
        els.chatInput.value = '';
        autoResizeTextarea();
        renderChatThread({ loading: true });
        setChatBusy(true);

        try {
            const history = state.chatMessages.slice();
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    mode: 'chat',
                    messages: history,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || `Chat failed with status ${response.status}`);
            }

            state.chatMessages.push({
                role: 'assistant',
                content: buildAiBody(data),
            });
            renderChatThread();
        } catch (error) {
            state.chatMessages.push({
                role: 'assistant',
                content: error.message || 'Quorix AI chat đang gặp lỗi tạm thời.',
            });
            renderChatThread();
        } finally {
            setChatBusy(false);
        }
    }

    function setChatBusy(isBusy) {
        state.chatBusy = isBusy;
        updateChatComposerState();
    }

    function updateChatComposerState() {
        if (els.chatSend) {
            els.chatSend.toggleAttribute('disabled', state.chatBusy);
        }
        if (els.chatInput) {
            els.chatInput.toggleAttribute('disabled', state.chatBusy);
        }
    }

    function renderChatThread(options = {}) {
        if (!els.chatThread) return;

        const loadingMarkup = options.loading
            ? [
                '<article class="qx-chat-msg is-loading">',
                '<p class="qx-chat-meta">Quorix AI</p>',
                '<div class="qx-chat-bubble">Đang trả lời...</div>',
                '</article>',
            ].join('')
            : '';

        els.chatThread.innerHTML = state.chatMessages.map(function (message) {
            const isUser = message.role === 'user';
            const label = isUser ? 'Bạn' : 'Quorix AI';
            const bubble = isUser
                ? renderPlainText(message.content)
                : renderRichText(message.content);

            return [
                `<article class="qx-chat-msg${isUser ? ' is-user' : ''}">`,
                `<p class="qx-chat-meta">${label}</p>`,
                `<div class="qx-chat-bubble">${bubble}</div>`,
                '</article>',
            ].join('');
        }).join('') + loadingMarkup;

        els.chatThread.scrollTop = els.chatThread.scrollHeight;
    }

    function setChatContext(message) {
        if (els.chatContext) {
            els.chatContext.textContent = message;
        }
    }

    function handleGlobalKeys(event) {
        if (!root.contains(document.activeElement)) return;

        if (event.key === 'Escape') {
            if (els.stage?.classList.contains('is-chat')) {
                closeChatShell();
                return;
            }

            if (document.activeElement === els.input && !getQueryFromInput()) {
                resetBrowseState();
            }
        }

        if (!state.resultLinks.length || document.activeElement === els.chatInput) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            moveResultFocus(1);
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            moveResultFocus(-1);
        }
    }

    function moveResultFocus(direction) {
        if (!state.resultLinks.length) return;

        const activeElement = document.activeElement;
        let nextIndex = state.activeResultIndex;

        if (activeElement === els.input || nextIndex < 0) {
            nextIndex = direction > 0 ? 0 : state.resultLinks.length - 1;
        } else {
            nextIndex += direction;
        }

        if (nextIndex < 0) {
            state.activeResultIndex = -1;
            clearResultSelection();
            if (els.input) els.input.focus();
            return;
        }

        if (nextIndex >= state.resultLinks.length) {
            nextIndex = state.resultLinks.length - 1;
        }

        state.activeResultIndex = nextIndex;
        clearResultSelection();

        const link = state.resultLinks[nextIndex];
        const card = link?.closest('.qx-fast-card');
        if (card) {
            card.setAttribute('aria-selected', 'true');
        }
        if (link) {
            link.focus();
        }
    }

    function clearResultSelection() {
        Array.from(els.results?.querySelectorAll('.qx-fast-card[aria-selected="true"]') || []).forEach(function (card) {
            card.removeAttribute('aria-selected');
        });
    }

    function validateQuery(query, focusTarget) {
        if (!query) {
            focusTarget?.focus();
            return false;
        }

        if (query.length < 2) {
            setStatus('Từ khóa cần dài ít nhất 2 ký tự.');
            focusTarget?.focus();
            return false;
        }

        if (query.length > 180) {
            setStatus('Từ khóa hoặc câu hỏi cần ngắn hơn 180 ký tự.');
            focusTarget?.focus();
            return false;
        }

        return true;
    }

    function autoResizeTextarea() {
        if (!els.chatInput) return;
        els.chatInput.style.height = 'auto';
        els.chatInput.style.height = `${Math.min(els.chatInput.scrollHeight, 176)}px`;
    }

    function getQueryFromInput() {
        return String(els.input?.value || '').trim();
    }

    function setStatus(message) {
        if (els.status) {
            els.status.textContent = message;
        }
    }

    function setCount(message) {
        if (els.count) {
            els.count.textContent = message;
        }
    }

    function toggleQuickChips(isVisible) {
        if (els.quickChipBar) {
            els.quickChipBar.hidden = !isVisible;
        }
    }

    function syncQueryParam(query) {
        const url = new URL(window.location.href);
        if (query) {
            url.searchParams.set('q', query);
        } else {
            url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
    }

    function renderPlainText(text) {
        return escapeHtml(String(text || '')).replace(/\n/g, '<br>');
    }

    function renderRichText(text) {
        const source = String(text || '').trim();
        if (!source) return '<p>Không có nội dung.</p>';

        const codeBlocks = [];
        let html = escapeHtml(source).replace(/\r\n/g, '\n');

        html = html.replace(/```([\w-]*)\n([\s\S]*?)```/g, function (_, language, code) {
            const token = `__CODE_BLOCK_${codeBlocks.length}__`;
            const langClass = language ? ` class="language-${escapeAttribute(language)}"` : '';
            codeBlocks.push(`<pre><code${langClass}>${code.trim()}</code></pre>`);
            return token;
        });

        html = html
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`\n]+)`/g, '<code>$1</code>');

        const blocks = html.split(/\n{2,}/).map(function (block) {
            const trimmed = block.trim();
            if (!trimmed) return '';

            if (/^__CODE_BLOCK_\d+__$/.test(trimmed)) {
                return trimmed;
            }

            const lines = trimmed.split('\n');
            const isBulletList = lines.every(function (line) {
                return /^[-*]\s+/.test(line);
            });

            const isOrderedList = lines.every(function (line) {
                return /^\d+\.\s+/.test(line);
            });

            if (isBulletList) {
                return `<ul>${lines.map(function (line) {
                    return `<li>${line.replace(/^[-*]\s+/, '')}</li>`;
                }).join('')}</ul>`;
            }

            if (isOrderedList) {
                return `<ol>${lines.map(function (line) {
                    return `<li>${line.replace(/^\d+\.\s+/, '')}</li>`;
                }).join('')}</ol>`;
            }

            return `<p>${lines.join('<br>')}</p>`;
        }).filter(Boolean);

        let output = blocks.join('');
        codeBlocks.forEach(function (block, index) {
            output = output.replace(`__CODE_BLOCK_${index}__`, block);
        });

        return output;
    }

    function capitalize(value) {
        const text = String(value || '').trim();
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function escapeRegex(value) {
        return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/"/g, '&quot;');
    }
}

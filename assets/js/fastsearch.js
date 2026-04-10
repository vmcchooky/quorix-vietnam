import * as params from '@params';

let fuse;
let resList = document.getElementById('searchResults');
let sInput = document.getElementById('searchInput');
let statusNode = document.getElementById('searchStatus');
let countNode = document.getElementById('searchResultCount');
let quickQueries = Array.from(document.querySelectorAll('[data-search-query]'));
let first;
let last;
let currentElem = null;
let resultsAvailable = false;

function setStatus(message) {
    if (statusNode) {
        statusNode.textContent = message;
    }
}

function setCount(message) {
    if (countNode) {
        countNode.textContent = message;
    }
}

window.onload = function () {
    setStatus('Đang nạp chỉ mục tìm kiếm...');
    setCount('');

    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data) {
                    let options = {
                        distance: 100,
                        threshold: 0.4,
                        ignoreLocation: true,
                        keys: ['title', 'permalink', 'summary', 'content']
                    };
                    if (params.fuseOpts) {
                        options = {
                            isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
                            includeScore: params.fuseOpts.includescore ?? false,
                            includeMatches: params.fuseOpts.includematches ?? false,
                            minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
                            shouldSort: params.fuseOpts.shouldsort ?? true,
                            findAllMatches: params.fuseOpts.findallmatches ?? false,
                            keys: params.fuseOpts.keys ?? ['title', 'permalink', 'summary', 'content'],
                            location: params.fuseOpts.location ?? 0,
                            threshold: params.fuseOpts.threshold ?? 0.4,
                            distance: params.fuseOpts.distance ?? 100,
                            ignoreLocation: params.fuseOpts.ignorelocation ?? true
                        };
                    }
                    let indexItems = Array.isArray(data) ? data : (Array.isArray(data.items) ? data.items : []);
                    fuse = new Fuse(indexItems, options);
                    setStatus('Chỉ mục đã sẵn sàng. Nhập từ khóa hoặc chọn một gợi ý bên dưới.');
                }
            } else {
                setStatus('Không thể nạp dữ liệu tìm kiếm. Vui lòng thử lại sau.');
                console.log(xhr.responseText);
            }
        }
    };
    xhr.open('GET', '/index.json');
    xhr.send();
};

function setActiveItem(anchor) {
    Array.from(resList.children).forEach((item) => {
        item.removeAttribute('aria-selected');
    });
    if (!anchor) return;
    currentElem = anchor;
    anchor.focus();
    if (anchor.parentElement) {
        anchor.parentElement.setAttribute('aria-selected', 'true');
    }
}

function reset() {
    resultsAvailable = false;
    currentElem = null;
    resList.innerHTML = '';
    sInput.value = '';
    setCount('');
    setStatus('Chỉ mục đã sẵn sàng. Nhập từ khóa hoặc chọn một gợi ý bên dưới.');
    sInput.focus();
}

function renderResults(query) {
    if (!fuse) {
        setStatus('Đang nạp chỉ mục tìm kiếm...');
        return;
    }

    let normalizedQuery = query.trim();

    if (!normalizedQuery) {
        resultsAvailable = false;
        currentElem = null;
        resList.innerHTML = '';
        setCount('');
        setStatus('Chỉ mục đã sẵn sàng. Nhập từ khóa hoặc chọn một gợi ý bên dưới.');
        return;
    }

    let results;
    if (params.fuseOpts) {
        results = fuse.search(normalizedQuery, { limit: params.fuseOpts.limit });
    } else {
        results = fuse.search(normalizedQuery);
    }

    if (results.length !== 0) {
        let resultSet = '';
        setStatus('Kết quả đã được cập nhật.');
        setCount(`Tìm thấy ${results.length} kết quả cho "${normalizedQuery}".`);

        for (let item in results) {
            const entry = results[item].item;
            resultSet += `<li class="qx-card qx-p-6 qx-d-grid qx-gap-2">` +
                `<p class="qx-text-muted">${entry.section || 'Content'}</p>` +
                `<h3><a href="${entry.permalink}" aria-label="${entry.title}">${entry.title}</a></h3>` +
                `<p>${entry.summary || ''}</p>` +
                `</li>`;
        }

        resList.innerHTML = resultSet;
        resultsAvailable = true;
        first = resList.firstChild;
        last = resList.lastChild;
    } else {
        resultsAvailable = false;
        currentElem = null;
        setStatus('Không có kết quả phù hợp.');
        setCount(`0 kết quả cho "${normalizedQuery}".`);
        resList.innerHTML = '<li class="qx-card qx-p-6 qx-d-grid qx-gap-2"><h2>Không có kết quả</h2><p class="qx-text-muted">Thử từ khóa khác hoặc dùng cụm ngắn hơn.</p></li>';
    }
}

sInput.onkeyup = function () {
    renderResults(this.value);
};

sInput.addEventListener('search', function () {
    if (!this.value) reset();
});

quickQueries.forEach((button) => {
    button.addEventListener('click', function () {
        let query = this.getAttribute('data-search-query') || '';
        sInput.value = query;
        renderResults(query);
        sInput.focus();
    });
});

document.onkeydown = function (e) {
    let key = e.key;
    let ae = document.activeElement;
    let inbox = document.getElementById('searchbox').contains(ae);

    if (ae !== sInput && currentElem) ae = currentElem;

    if (key === 'Escape') {
        reset();
    } else if (!resultsAvailable || !inbox) {
        return;
    } else if (key === 'ArrowDown') {
        e.preventDefault();
        if (ae === sInput) {
            setActiveItem(resList.firstChild?.querySelector('a'));
        } else if (ae.parentElement !== last) {
            setActiveItem(ae.parentElement.nextSibling?.querySelector('a'));
        }
    } else if (key === 'ArrowUp') {
        e.preventDefault();
        if (ae.parentElement === first) {
            sInput.focus();
        } else if (ae !== sInput) {
            setActiveItem(ae.parentElement.previousSibling?.querySelector('a'));
        }
    } else if (key === 'ArrowRight') {
        ae.click();
    }
};

// ─── AI Search Client ─────────────────────────────────────────────────────────

const aiBtn = document.getElementById('aiSearchBtn');
const aiPanel = document.getElementById('ai-panel');
const aiAnswer = document.getElementById('ai-answer');
const aiConfidenceBadge = document.getElementById('ai-confidence-badge');
const aiProviderBadge = document.getElementById('ai-provider-badge');
const aiFollowups = document.getElementById('ai-followups');
const aiCitations = document.getElementById('ai-citations');

const CONFIDENCE_BADGE = {
    high:   { cls: 'qx-badge-green',       label: 'Độ chính xác cao' },
    medium: { cls: 'qx-badge-soft-blue',   label: 'Độ chính xác vừa' },
    low:    { cls: 'qx-badge-soft-yellow', label: 'Độ chính xác thấp' },
};

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showAiPanel() { aiPanel && aiPanel.classList.remove('qx-d-none'); }
function hideAiPanel()  { aiPanel && aiPanel.classList.add('qx-d-none'); }

function setAiLoading(query) {
    showAiPanel();
    if (aiConfidenceBadge) { aiConfidenceBadge.className = ''; aiConfidenceBadge.textContent = ''; }
    if (aiProviderBadge)   aiProviderBadge.textContent = '';
    if (aiFollowups)       aiFollowups.innerHTML = '';
    if (aiCitations)       aiCitations.innerHTML = '';
    if (aiAnswer)          aiAnswer.textContent = `Đang hỏi AI về "${query}"…`;
    if (aiBtn)             aiBtn.setAttribute('disabled', '');
}

function resetAiBtn() {
    if (aiBtn) aiBtn.removeAttribute('disabled');
}

function renderAiResult(data) {
    if (aiAnswer) aiAnswer.textContent = data.answer || 'Không có câu trả lời.';

    if (aiConfidenceBadge) {
        const conf = CONFIDENCE_BADGE[data.confidence] || CONFIDENCE_BADGE.medium;
        aiConfidenceBadge.className = conf.cls;
        aiConfidenceBadge.textContent = conf.label;
    }

    if (aiProviderBadge && data.provider) {
        aiProviderBadge.textContent = `via ${data.provider}${data.model ? ' · ' + data.model : ''}`;
    }

    if (aiCitations) {
        const cits = Array.isArray(data.citations) ? data.citations.slice(0, 5) : [];
        aiCitations.innerHTML = cits.map((c) =>
            `<article class="qx-card qx-p-6 qx-d-grid qx-gap-2 qx-shadow-sm">` +
            `<div class="qx-d-flex qx-flex-wrap qx-gap-2">` +
            `<span class="qx-badge-soft-blue">${escapeHtml(c.section || 'post')}</span>` +
            (c.readingTime ? `<span class="qx-text-muted">${c.readingTime} phút đọc</span>` : '') +
            `</div>` +
            `<h3><a href="${escapeHtml(c.url)}">${escapeHtml(c.title)}</a></h3>` +
            (c.excerpt ? `<p class="qx-text-muted">${escapeHtml(c.excerpt.slice(0, 200))}</p>` : '') +
            `<a class="qx-btn qx-btn-ghost" href="${escapeHtml(c.url)}">Đọc bài</a>` +
            `</article>`
        ).join('');
    }

    if (aiFollowups) {
        const followUps = Array.isArray(data.followUps) ? data.followUps.slice(0, 4) : [];
        aiFollowups.innerHTML = followUps.map((q) =>
            `<button class="qx-btn qx-btn-ghost" type="button" data-ai-followup="${escapeHtml(q)}">${escapeHtml(q)}</button>`
        ).join('');
        aiFollowups.querySelectorAll('[data-ai-followup]').forEach((btn) => {
            btn.addEventListener('click', function () {
                const q = this.getAttribute('data-ai-followup') || '';
                if (!q || !sInput) return;
                sInput.value = q;
                renderResults(q);
                runAiSearch(q);
            });
        });
    }

    showAiPanel();
}

function renderAiError(message) {
    showAiPanel();
    if (aiConfidenceBadge) { aiConfidenceBadge.className = 'qx-badge-soft-yellow'; aiConfidenceBadge.textContent = 'Lỗi'; }
    if (aiProviderBadge)   aiProviderBadge.textContent = '';
    if (aiFollowups)       aiFollowups.innerHTML = '';
    if (aiCitations)       aiCitations.innerHTML = '';
    if (aiAnswer)          aiAnswer.textContent = message || 'AI search gặp lỗi. Vui lòng thử lại.';
}

async function runAiSearch(query) {
    const q = String(query || '').trim();
    if (!q || q.length < 2) return;
    setAiLoading(q);
    try {
        const res = await fetch('/api/ai-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q, mode: 'search', topK: 5 }),
        });
        const data = await res.json();
        if (!res.ok) { renderAiError(data?.error || `Lỗi ${res.status} từ AI server.`); return; }
        if (data.notice?.type === 'config') { renderAiError(`Chưa cấu hình API key: ${data.notice.message}`); return; }
        renderAiResult(data);
    } catch (err) {
        renderAiError('Không thể kết nối đến AI server. Vui lòng kiểm tra mạng hoặc thử lại sau.');
    } finally {
        resetAiBtn();
    }
}

if (aiBtn) {
    aiBtn.addEventListener('click', function () {
        const q = sInput ? sInput.value.trim() : '';
        if (!q) { sInput && sInput.focus(); return; }
        runAiSearch(q);
    });
}

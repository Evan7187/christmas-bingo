'use strict';
// Keep this endpoint unless you deliberately create a different Apps Script deployment.
const API_URL = 'https://script.google.com/macros/s/AKfycbwTf3_KBWv-uMdS_cP5as62CDnZwR2KeSxB9xN58-CBog-Y0g_-oYastKuJOKHJLCD8/exec';
const $ = id => document.getElementById(id), KEY = 'christmas-bingo-v2-token', LIST = 'christmas-bingo-players';
let db, INFO = null, card = null, token = '', players = [], busy = false, selected = null;
const photos = new Map();
function message(t, err = false) { $('message').textContent = t; $('message').className = err ? 'error' : ''; }
function openDB() { return new Promise((res, rej) => { const r = indexedDB.open('christmas-bingo-v2', 2); r.onupgradeneeded = () => { for (const [n, k] of [['photos', 'key'], ['cards', 'token'], ['kv', 'key']])
    if (!r.result.objectStoreNames.contains(n))
        r.result.createObjectStore(n, { keyPath: k }); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(Error('This browser cannot save your card. Use a regular browser, not private browsing.')); r.onblocked = () => rej(Error('Close other Bingo tabs, then reopen this page.')); }); }
function read(store, key) { return new Promise((res, rej) => { const r = db.transaction(store).objectStore(store).get(key); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
function all(store) { return new Promise((res, rej) => { const r = db.transaction(store).objectStore(store).getAll(); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
function writeRecords(records) { return new Promise((res, rej) => { const tx = db.transaction([...new Set(records.map(r => r[0]))], 'readwrite'); records.forEach(([s, v]) => tx.objectStore(s).put(v)); tx.oncomplete = () => res(); tx.onerror = tx.onabort = () => rej(Error('Could not save on this device. Keep your original photos and free some browser storage.')); }); }
async function saveCard() { await writeRecords([['cards', card]]); }
async function savePlayers() { await writeRecords([['kv', { key: 'players', value: players }], ['kv', { key: 'active', value: token }]]); try {
    localStorage.setItem(LIST, JSON.stringify(players));
    localStorage.setItem(KEY, token);
}
catch (e) { } }
function legacy(key, fallback) { try {
    return localStorage.getItem(key) || fallback;
}
catch (e) {
    return fallback;
} }
async function rpc(action, ...args) { const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 60000); try {
    const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, args }), signal: controller.signal });
    let out;
    try {
        out = await res.json();
    }
    catch (e) {
        throw Error('Unexpected server response. Check the Apps Script deployment.');
    }
    if (!out.ok)
        throw Error(out.error || 'Server error.');
    return out.data;
}
catch (e) {
    if (e.name === 'AbortError' || e instanceof TypeError)
        throw Error('Could not reach the game server. Your saved photos are still on this device.');
    throw e;
}
finally {
    clearTimeout(timer);
} }
function canPlay() { return !!INFO && INFO.state === 'open' && Date.now() >= INFO.startMs && Date.now() <= INFO.endMs && (!card || !card.eventId || card.eventId === INFO.eventId); }
function statusText() { if (!INFO)
    return 'Open the game online once to prepare your card.'; if (card && card.eventId !== INFO.eventId)
    return 'This card belongs to an earlier event. Start a new player card for this event.'; if (INFO.state === 'paused')
    return 'Christmas Bingo is paused. Please try again later.'; if (Date.now() < INFO.startMs || INFO.state === 'upcoming')
    return 'Christmas Bingo opens ' + INFO.text.startDate + '. See you then!'; if (Date.now() > INFO.endMs || INFO.state === 'closed')
    return 'The entry deadline has passed. Thank you for playing!'; if (card && card.submitted)
    return 'Entry received: ' + card.receipt + '. Pending organizer review.'; if (card && card.draft)
    return 'Submission started. Tap Submit Bingo to finish. Photos remain on this device.'; return 'Your card and photos are saved on this device.'; }
function applyInfo() { if (!INFO)
    return; document.querySelectorAll('[data-i]').forEach(el => { if (INFO.text[el.dataset.i])
    el.textContent = INFO.text[el.dataset.i]; }); }
function lines() { const out = []; for (let n = 0; n < 5; n++) {
    out.push(Array.from({ length: 5 }, (_, i) => n * 5 + i), Array.from({ length: 5 }, (_, i) => i * 5 + n));
} return out.concat([[0, 6, 12, 18, 24], [4, 8, 12, 16, 20]]); }
function winning(order = card ? card.order : []) { const s = new Set(order); s.add(12); return lines().filter(l => l.every(i => s.has(i))); }
function firstCount(order) { for (let n = 1; n <= order.length; n++)
    if (winning(order.slice(0, n)).length)
        return n; return null; }
function shortClue(c) { const s = c.replace(/^find (an? )?/i, ''); return s.charAt(0).toUpperCase() + s.slice(1); }
function fitText() { document.querySelectorAll('.tile .clue').forEach(el => { el.style.fontSize = ''; const tile = el.parentElement, max = tile.classList.contains('photo') ? tile.clientHeight * .45 : tile.clientHeight - 6; let size = parseFloat(getComputedStyle(el).fontSize); while (size > 6.5 && (el.scrollWidth > el.clientWidth + .5 || el.scrollHeight > max)) {
    size -= .5;
    el.style.fontSize = size + 'px';
} }); }
function drawPlayers() { const sel = $('player'); sel.replaceChildren(); players.forEach(p => { const o = document.createElement('option'); o.value = p.token; o.textContent = p.label; o.selected = p.token === token; sel.append(o); }); sel.disabled = busy || players.length < 2; $('newPlayer').disabled = busy || !INFO || INFO.state !== 'open' || Date.now() > INFO.endMs; $('renamePlayer').disabled = busy || !card; }
function render() { drawPlayers(); for (const id of ['save', 'print'])
    $(id).disabled = busy || !card; $('refresh').disabled = busy; $('claim').disabled = busy || !card || !winning().length || card.submitted || !canPlay(); $('claim').hidden = !!(card && card.submitted); $('grid').replaceChildren(); $('code').textContent = token; if (!card) {
    $('progress').textContent = '';
    return;
} const wins = new Set(winning().flat()); card.clues.forEach((clue, i) => { const b = document.createElement('button'), p = photos.get(i); b.type = 'button'; b.className = 'tile' + (i === 12 ? ' free' : '') + (p ? ' photo' : '') + (wins.has(i) ? ' win' : ''); b.disabled = i === 12 || busy || card.submitted || card.draft || !canPlay(); b.title = clue; b.setAttribute('aria-label', clue); if (p) {
    const im = document.createElement('img');
    im.src = p.data;
    im.alt = '';
    b.append(im);
} const t = document.createElement('span'); t.className = 'clue'; t.textContent = i === 12 ? 'FREE' : shortClue(clue); b.append(t); if (p) {
    const s = document.createElement('span');
    s.className = 'badge';
    s.textContent = '✓';
    s.title = 'Saved on this device';
    b.append(s);
} b.onclick = () => { selected = i; $('file').click(); }; $('grid').append(b); }); $('progress').textContent = card.order.length + ' / 24 clues completed • Photos saved on this device' + (card.firstBingoCount ? ' • First Bingo after ' + card.firstBingoCount + ' clues' : ''); fitText(); }
function resetForm() { if ($('entry').open)
    $('entry').close(); $('entryForm').reset(); delete $('entryForm').elements.name.dataset.auto; $('entryError').textContent = ''; $('uploadProgress').textContent = ''; }
async function activate(t) { const local = await read('cards', t); if (!local)
    throw Error('This card is not saved on this device. Use Restore while online.'); token = t; card = local; photos.clear(); for (const p of await all('photos'))
    if (p.token === t)
        photos.set(p.slot, p); resetForm(); await savePlayers(); render(); message(statusText()); }
async function acceptRemote(t, remote) { let local = await read('cards', t); if (!local) {
    const old = (await all('photos')).filter(p => p.token === t);
    const ids = [...new Set([...(remote.saved || []), ...old.map(p => p.slot)])];
    local = { token: t, clues: remote.clues, eventId: remote.eventId, order: remote.manifest ? remote.manifest.order.slice() : ids, historyReliable: ids.length === 0 && !remote.manifest, firstBingoCount: remote.manifest ? remote.manifest.firstBingoCount : null, prompted: false, receipt: remote.receipt || '', submitted: remote.submitted, draft: !!remote.manifest && !remote.submitted };
} local.receipt = remote.receipt || local.receipt; local.submitted = !!remote.submitted; local.eventId = remote.eventId; local.clues = remote.clues; if (remote.manifest) {
    local.order = remote.manifest.order.slice();
    local.firstBingoCount = remote.manifest.firstBingoCount;
    local.historyReliable = remote.manifest.historyReliable;
    local.draft = !remote.submitted;
} await writeRecords([['cards', local]]); if (!players.some(p => p.token === t))
    players.push({ token: t, label: 'Player ' + (players.length + 1) }); await activate(t); for (const i of remote.saved || []) {
    if (photos.has(i))
        continue;
    try {
        const data = await rpc('getPhoto', t, i), p = { key: t + ':' + i, token: t, slot: i, data, requestId: crypto.randomUUID(), uploaded: true };
        await writeRecords([['photos', p]]);
        photos.set(i, p);
    }
    catch (e) {
        message('Some photo previews are not available on this device. Keep the original playing device.', true);
    }
} render(); }
async function refreshInfo() { const fresh = await rpc('info'); INFO = fresh; await writeRecords([['kv', { key: 'info', value: fresh }]]); applyInfo(); }
async function newPlayer() { if (busy)
    return; busy = true; render(); try {
    await refreshInfo();
    if (INFO.state !== 'open')
        throw Error(statusText());
    const r = await rpc('newCard');
    const local = { token: r.token, clues: r.card.clues, eventId: r.card.eventId, order: [], historyReliable: true, firstBingoCount: null, prompted: false, receipt: '', submitted: false, draft: false };
    await writeRecords([['cards', local]]);
    players.push({ token: r.token, label: 'Player ' + (players.length + 1) });
    await activate(r.token);
    message('New card ready. Tap Rename to add a name. Good luck!');
}
catch (e) {
    message(e.message, true);
}
finally {
    busy = false;
    render();
} }
function renamePlayer() { if (busy || !card)
    return; const p = players.find(p => p.token === token), v = prompt('Name for this card:', p && !/^(Player \d+|Restored card)$/.test(p.label) ? p.label : ''); if (v === null)
    return; const name = v.replace(/[\x00-\x1f]/g, '').trim().slice(0, 30); if (!name)
    return; p.label = name; savePlayers().then(render).catch(e => message(e.message, true)); }
function openEntry() { if (!card || card.submitted || !winning().length)
    return; if (!canPlay()) {
    message(statusText(), true);
    return;
} const f = $('entryForm').elements.name, p = players.find(p => p.token === token), name = p && !/^(Player \d+|Restored card)$/.test(p.label) ? p.label : ''; if (!f.value || f.value === f.dataset.auto) {
    f.value = name;
    f.dataset.auto = name;
} $('entryError').textContent = ''; if (!$('entry').open)
    $('entry').showModal(); }
function loadImage(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(Error('This photo format is not supported. Try a JPEG from your photo library.')); im.src = src; }); }
async function compress(file) { if (file.size > 25000000)
    throw Error('Choose a photo under 25 MB.'); const url = URL.createObjectURL(file); try {
    const im = await loadImage(url), s = Math.min(1, 1600 / Math.max(im.width, im.height)), c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(im.width * s));
    c.height = Math.max(1, Math.round(im.height * s));
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    for (const q of [.85, .75, .65, .5, .35]) {
        const data = c.toDataURL('image/jpeg', q);
        if (data.length <= 1300000)
            return data;
    }
    throw Error('Photo is too large. Try a smaller image.');
}
finally {
    URL.revokeObjectURL(url);
} }
async function attach(slot, file) { if (!card || card.submitted || card.draft || !canPlay())
    throw Error('This card cannot be changed now.'); const data = await compress(file), next = structuredClone(card); if (!next.order.includes(slot))
    next.order.push(slot); if (next.firstBingoCount === null && next.historyReliable && winning(next.order).length)
    next.firstBingoCount = next.order.length; const show = winning(next.order).length && !next.prompted; if (show)
    next.prompted = true; const p = { key: token + ':' + slot, token, slot, data, requestId: crypto.randomUUID(), uploaded: false }; await writeRecords([['photos', p], ['cards', next]]); card = next; photos.set(slot, p); return show; }
async function handlePhoto(e) { const f = e.target.files[0], slot = selected; e.target.value = ''; if (!f || slot === null || busy)
    return; busy = true; render(); let show = false; try {
    show = await attach(slot, f);
    message(show ? 'You have Bingo!' : 'Photo saved on this device.');
}
catch (e) {
    message(e.message, true);
}
finally {
    busy = false;
    render();
    if (show)
        openEntry();
} }
// Full photo is contained above its label, rather than cropped to a square.
async function buildCardImage(opts = {}) {
    if (!card)
        throw Error('No card loaded.');
    const priv = !!opts.isPrivate, T = priv ? 360 : 240, G = 8, P = 30, H = priv ? 260 : 200, W = P * 2 + T * 5 + G * 4, HEIGHT = H + P + T * 5 + G * 4 + P, c = document.createElement('canvas');
    c.width = W;
    c.height = HEIGHT;
    const x = c.getContext('2d');
    x.fillStyle = '#0d3d29';
    x.fillRect(0, 0, W, HEIGHT);
    x.fillStyle = '#b3202a';
    x.fillRect(0, 0, W, H);
    x.fillStyle = '#d9a634';
    x.fillRect(0, H - 8, W, 8);
    x.textAlign = 'center';
    x.fillStyle = '#fff';
    x.font = 'bold ' + (priv ? 64 : 48) + 'px Georgia';
    x.fillText('Christmas Bingo', W / 2, 78);
    x.fillStyle = '#ffe7a8';
    x.font = 'italic bold ' + (priv ? 38 : 30) + 'px Georgia';
    x.fillText('Find Your Christmas Spirit.', W / 2, 128);
    x.fillStyle = '#fff';
    function fitLine(text, y, maxSize) { let size = maxSize; x.font = size + 'px system-ui'; while (size > 12 && x.measureText(text).width > W - 60) {
        size--;
        x.font = size + 'px system-ui';
    } x.fillText(text, W / 2, y); }
    if (priv) {
        fitLine(opts.name + ' • ' + new Date().toLocaleDateString(), 170, 32);
        fitLine([opts.phone, opts.email].filter(Boolean).join(' • '), 207, 28);
        fitLine(card.firstBingoCount ? 'Bingo after ' + card.firstBingoCount + ' clues • ' + card.order.length + ' completed' : 'Clues completed: ' + card.order.length, 240, 24);
    }
    else
        fitLine('Community Christmas Bingo', 170, 24);
    const win = new Set(winning().flat());
    function wrap(text, cx, y, width, size) { x.font = 'bold ' + size + 'px system-ui'; const words = text.split(' '), ls = []; let l = ''; for (const w of words) {
        const test = l ? l + ' ' + w : w;
        if (x.measureText(test).width > width && l) {
            ls.push(l);
            l = w;
        }
        else
            l = test;
    } if (l)
        ls.push(l); ls.forEach((l, i) => x.fillText(l, cx, y + i * (size + 3))); }
    for (let i = 0; i < 25; i++) {
        const tx = P + (i % 5) * (T + G), ty = H + P + Math.floor(i / 5) * (T + G), p = photos.get(i), labelH = priv ? 85 : 68;
        x.fillStyle = i === 12 ? '#b3202a' : '#fffaf0';
        x.fillRect(tx, ty, T, T);
        if (i === 12) {
            x.fillStyle = '#fff';
            x.font = 'bold ' + (priv ? 64 : 44) + 'px Georgia';
            x.fillText('FREE', tx + T / 2, ty + T / 2 + 15);
        }
        else if (p && card.order.includes(i)) {
            const im = await loadImage(p.data), areaH = T - labelH, s = Math.min(T / im.width, areaH / im.height), w = im.width * s, h = im.height * s;
            x.fillStyle = '#0d3d29';
            x.fillRect(tx, ty, T, T);
            x.drawImage(im, tx + (T - w) / 2, ty + (areaH - h) / 2, w, h);
            x.fillStyle = '#fff';
            wrap(card.clues[i], tx + T / 2, ty + areaH + 24, T - 20, priv ? 23 : 18);
        }
        else {
            x.fillStyle = '#65756a';
            wrap(card.clues[i], tx + T / 2, ty + T / 2 - 20, T - 20, priv ? 23 : 18);
        }
        if (win.has(i)) {
            x.strokeStyle = '#d9a634';
            x.lineWidth = 10;
            x.strokeRect(tx + 5, ty + 5, T - 10, T - 10);
        }
    }
    for (const q of [.9, .82, .72, .6, .45]) {
        const data = c.toDataURL('image/jpeg', q);
        if (data.length <= 5200000)
            return data;
    }
    throw Error('Card image is too large to submit.');
}
async function saveMyCard() { if (busy || !card)
    return; busy = true; render(); try {
    const data = await buildCardImage(), blob = await (await fetch(data)).blob(), file = new File([blob], 'christmas-bingo.jpg', { type: 'image/jpeg' });
    if (navigator.canShare && navigator.canShare({ files: [file] }))
        await navigator.share({ files: [file], title: 'Christmas Bingo' });
    else {
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.append(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
    }
    message('Card picture ready. No name or contact information included.');
}
catch (e) {
    if (e.name !== 'AbortError')
        message(e.message, true);
}
finally {
    busy = false;
    render();
} }
function preparePrint() { if (!card)
    throw Error('Load a card first.'); const g = $('pgrid'); g.replaceChildren(); card.clues.forEach((clue, i) => { const d = document.createElement('div'); if (i === 12) {
    d.className = 'pc pfree';
    d.innerHTML = '<small>✶</small>FREE<small>✶</small>';
}
else {
    d.className = 'pc';
    const c = document.createElement('div');
    c.className = 'pclue';
    c.textContent = clue;
    const w = document.createElement('div');
    w.className = 'ploc';
    w.textContent = 'Location:';
    const w2 = document.createElement('div');
    w2.className = 'ploc2';
    const box = document.createElement('div');
    box.append(w, w2);
    d.append(c, box);
} g.append(d); }); $('purl').textContent = location.origin + location.pathname; }
function printCard() { try {
    preparePrint();
    window.print();
}
catch (e) {
    message(e.message, true);
} }
async function submit(e) { e.preventDefault(); if (busy || !card)
    return; const f = $('entryForm'), info = { name: f.elements.name.value.trim(), phone: f.elements.phone.value.trim(), email: f.elements.email.value.trim(), consent: f.elements.consent.checked }; $('entryError').textContent = ''; if (!info.name || (!info.phone && !info.email) || !info.consent) {
    $('entryError').textContent = 'Enter your name, a phone number or email, and check the agreement.';
    return;
} busy = true; $('send').disabled = true; $('later').disabled = true; render(); try {
    await refreshInfo();
    if (!canPlay())
        throw Error(statusText());
    const remote = await rpc('loadCard', token);
    if (remote.submitted) {
        card.receipt = remote.receipt;
        card.submitted = true;
        card.draft = false;
        await saveCard();
        resetForm();
        message(statusText());
        return;
    }
    for (const i of card.order)
        if (!photos.has(i))
            throw Error('Some photos are missing on this device. Use the original playing device to submit.');
    $('uploadProgress').textContent = 'Preparing your entry...';
    const m = await rpc('prepareSubmission', token, { order: card.order, historyReliable: card.historyReliable });
    if (m.receipt) {
        card.receipt = m.receipt;
        card.submitted = true;
        card.draft = false;
        await saveCard();
        resetForm();
        return;
    }
    if (JSON.stringify(m.order) !== JSON.stringify(card.order))
        throw Error('A submission already started with a different card state. Tap Refresh Status, then retry.');
    card.draft = true;
    await saveCard();
    for (let n = 0; n < m.selected.length; n++) {
        const i = m.selected[n], p = photos.get(i);
        $('uploadProgress').textContent = 'Uploading photo ' + (n + 1) + ' of ' + m.selected.length + '...';
        if (!p.uploaded) {
            await rpc('savePhoto', token, i, p.data, p.requestId);
            p.uploaded = true;
            await writeRecords([['photos', p]]);
        }
    }
    $('uploadProgress').textContent = 'Making your high-resolution card...';
    const priv = await buildCardImage({ isPrivate: true, ...info }), pub = await buildCardImage();
    $('uploadProgress').textContent = 'Submitting your entry...';
    const r = await rpc('submitEntry', token, info, priv, pub);
    card.receipt = r.receipt;
    card.submitted = true;
    card.draft = false;
    await saveCard();
    resetForm();
    message('Entry received: ' + r.receipt + '. Pending organizer review.');
}
catch (e) {
    $('entryError').textContent = e.message + ' Your saved photos remain on this device. Retry before the deadline.';
    $('uploadProgress').textContent = 'Entry not confirmed. You can retry without re-uploading confirmed photos.';
}
finally {
    busy = false;
    $('send').disabled = false;
    $('later').disabled = false;
    render();
} }
async function refreshStatus() { if (busy)
    return; busy = true; render(); try {
    await refreshInfo();
    if (card) {
        const remote = await rpc('loadCard', token);
        await acceptRemote(token, remote);
    }
    message(statusText());
}
catch (e) {
    message(e.message, true);
}
finally {
    busy = false;
    render();
} }
async function restore() { if (busy)
    return; busy = true; render(); try {
    await refreshInfo();
    const t = $('restoreCode').value.trim(), r = await rpc('loadCard', t);
    if (!players.some(p => p.token === t))
        players.push({ token: t, label: 'Restored card' });
    await acceptRemote(t, r);
    message('Card restored. Photos not uploaded from another device cannot be recovered here.');
}
catch (e) {
    message(e.message, true);
}
finally {
    busy = false;
    render();
} }
async function cacheShell() { if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    $('offlineReady').textContent = 'Offline reopening is not available here. Use the published HTTPS game page.';
    return;
} try {
    await navigator.serviceWorker.register('./sw.js');
    await navigator.serviceWorker.ready;
    $('offlineReady').textContent = 'Page prepared for offline reopening. Keep this browser and device.';
}
catch (e) {
    $('offlineReady').textContent = 'Photos save locally, but offline reopening is not ready. Reopen online before your hunt.';
} }
async function start() { try {
    db = await openDB();
    players = (await read('kv', 'players'))?.value || JSON.parse(legacy(LIST, '[]'));
    token = (await read('kv', 'active'))?.value || legacy(KEY, '');
    INFO = (await read('kv', 'info'))?.value || null;
    applyInfo();
    if (token && (await read('cards', token)))
        await activate(token);
    let online = false;
    try {
        await refreshInfo();
        online = true;
    }
    catch (e) {
        if (!card)
            throw e;
    }
    if (online) {
        if (card && card.eventId !== INFO.eventId) {
            message('The event was reset. Your old local card is kept; create a new card for this event.', true);
        }
        else if (token) {
            try {
                await acceptRemote(token, await rpc('loadCard', token));
            }
            catch (e) {
                if (!/Card not found/.test(e.message))
                    throw e;
                message('This card is no longer on the server. Create a new player card for this event.', true);
            }
        }
        if (!card && canPlay()) {
            const r = await rpc('newCard');
            await acceptRemote(r.token, r.card);
        }
    }
    if (card)
        message(statusText());
    else
        message(statusText());
    render();
    cacheShell();
}
catch (e) {
    message(e.message, true);
    render();
} }
$('file').onchange = handlePhoto;
$('claim').onclick = openEntry;
$('later').onclick = () => { if (!busy)
    $('entry').close(); };
$('entry').addEventListener('cancel', e => { if (busy)
    e.preventDefault(); });
$('entryForm').onsubmit = submit;
$('save').onclick = saveMyCard;
$('print').onclick = printCard;
$('refresh').onclick = refreshStatus;
$('newPlayer').onclick = newPlayer;
$('renamePlayer').onclick = renamePlayer;
$('restore').onclick = restore;
$('player').onchange = async (e) => { if (busy)
    return; try {
    await activate(e.target.value);
}
catch (e) {
    message(e.message, true);
} };
$('copy').onclick = async () => { try {
    await navigator.clipboard.writeText(token);
    message('Recovery code copied. Keep it private.');
}
catch (e) {
    message('Select and copy the recovery code manually.');
} };
let fitTimer;
window.addEventListener('resize', () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitText, 120); });
start();

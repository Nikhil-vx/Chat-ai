const log = document.getElementById('log');
const emptyState = document.getElementById('empty-state');
const composer = document.getElementById('composer');
const input = document.getElementById('input');
const sendBtn = document.getElementById('send');
const msgCount = document.getElementById('msg-count');
const newChatBtn = document.getElementById('new-chat');

let history = []; // { role: 'user' | 'assistant', content: string }

function renderMessage(role, content, pending = false) {
  const el = document.createElement('div');
  el.className = `msg ${role}${pending ? ' pending' : ''}`;
  el.innerHTML = `<span class="role-tag">${role === 'user' ? 'You' : 'Assistant'}</span>`;
  const body = document.createElement('span');
  body.textContent = content;
  el.appendChild(body);
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function updateCount() {
  const n = history.length;
  msgCount.textContent = `No. ${String(n).padStart(3, '0')}`;
}

function autoResize() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 200) + 'px';
}
input.addEventListener('input', autoResize);

input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    composer.requestSubmit();
  }
});

newChatBtn.addEventListener('click', () => {
  history = [];
  log.innerHTML = '';
  log.appendChild(emptyState);
  updateCount();
});

composer.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  if (emptyState.parentNode === log) log.remove ? null : emptyState.remove();
  if (log.contains(emptyState)) emptyState.remove();

  history.push({ role: 'user', content: text });
  renderMessage('user', text);
  updateCount();
  input.value = '';
  autoResize();

  sendBtn.disabled = true;
  const pendingEl = renderMessage('assistant', 'Thinking…', true);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }

    pendingEl.classList.remove('pending');
    pendingEl.querySelector('span:last-child').textContent = data.reply;
    history.push({ role: 'assistant', content: data.reply });
    updateCount();
  } catch (err) {
    pendingEl.classList.remove('pending');
    pendingEl.querySelector('span:last-child').textContent =
      `Error: ${err.message}. Check the server console and your API key.`;
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
});

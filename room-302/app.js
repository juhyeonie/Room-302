import { html, render, Component } from 'https://unpkg.com/htm@3.1.1/preact/standalone.module.js';
import { OBJ, HELP, SKILLS, PROJECTS, TIMELINE, CONTACTS, FACTS, LEARNING, MUSIC, MOMENTS, ACH, ABOUT } from './content.js';

// Page settings (were editable props in the design file)
const CONFIG = { ownerName: 'Justine Pelgone', showHotspots: false };

class App extends Component {
  state = { vw: window.innerWidth, vh: window.innerHeight, hover: null, lastHover: 'bed', bookName: null, active: null, lastSide: 'pc', lastModal: 'bed', mode: 'auto', sound: false, book: 0, fact: 0, tick: 0, ready: false, err: false };

  componentDidMount() {
    this.onResize = () => this.setState({ vw: window.innerWidth, vh: window.innerHeight });
    this.onKey = (e) => { if (e.key === 'Escape') this.close(); };
    window.addEventListener('resize', this.onResize);
    window.addEventListener('keydown', this.onKey);
    this.timer = setInterval(() => this.setState(s => ({ tick: s.tick + 1 })), 60000);
    this.boot();
  }
  async boot() {
    try {
      const mod = await import('./room3d.js');
      if (this.dead || !this.mountEl) return;
      this.room = await mod.createRoom(this.mountEl, this.labelEl, this.dotsEl, {
        onHover: (k, book) => { if (k !== this.state.hover || (book || null) !== this.state.bookName) this.setState(k ? { hover: k, lastHover: k, bookName: book || null } : { hover: null, bookName: null }); },
        onClick: (k, book) => { if (book) { const i = SKILLS.findIndex(s => s.name === book); if (i >= 0) this.setState({ book: i }); } this.open(k); },
      });
      if (this.dead) { this.room.dispose(); return; }
      this._night = this.isNight();
      this.room.setNight(this._night, true);
      this.setState({ ready: true });
    } catch (e) { console.error(e); this.setState({ err: true }); }
  }
  componentWillUnmount() {
    this.dead = true;
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('keydown', this.onKey);
    clearInterval(this.timer);
    if (this.room) this.room.dispose();
    if (this.ac) this.ac.close();
  }
  componentDidUpdate() {
    if (!this.room) return;
    const n = this.isNight();
    if (n !== this._night) { this._night = n; this.room.setNight(n); }
    if (this._lastActive !== this.state.active) {
      const a = this.state.active;
      this._lastActive = a;
      if (a && a !== 'help') {
        const { vw, vh } = this.state, mobile = vw < 820, side = OBJ[a].kind === 'side';
        const ox = mobile ? 0 : (side ? (Math.min(540, vw - 24) + 12) / 2 : (Math.min(440, vw - 48) + 24) / 2);
        const oy = mobile && !side ? vh * 0.24 : 0;
        this.room.focus(a, ox, oy);
      } else this.room.overview();
    }
  }
  isNight() {
    if (this.state.mode !== 'auto') return this.state.mode === 'night';
    const h = new Date().getHours();
    return h < 6 || h >= 18;
  }
  open(k) {
    this.blip();
    const kind = k === 'help' ? 'modal' : OBJ[k].kind;
    this.setState(kind === 'side' ? { active: k, lastSide: k, hover: null } : { active: k, lastModal: k, hover: null });
  }
  close = () => { if (this.state.active) this.setState({ active: null }); };
  reset = () => { this.blip(); this.setState({ active: null, hover: null, mode: 'auto' }); if (this.room) this.room.overview(); };
  toggleMode = () => { this.blip(); this.setState({ mode: this.isNight() ? 'day' : 'night' }); };
  nextFact = () => { this.blip(); this.setState(s => ({ fact: s.fact + 1 })); };

  ensureAudio() {
    if (this.ac) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    this.ac = new AC();
    const len = this.ac.sampleRate * 4, buf = this.ac.createBuffer(1, len, this.ac.sampleRate), data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; data[i] = last * 3.5; }
    const src = this.ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const f = this.ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
    this.amb = this.ac.createGain(); this.amb.gain.value = 0;
    src.connect(f); f.connect(this.amb); this.amb.connect(this.ac.destination); src.start();
    return true;
  }
  toggleSound = () => {
    const on = !this.state.sound;
    this.setState({ sound: on });
    if (on) {
      if (!this.ensureAudio()) return;
      this.ac.resume();
      this.amb.gain.setTargetAtTime(0.16, this.ac.currentTime, 0.8);
      setTimeout(() => this.blip(true), 30);
    } else if (this.amb) this.amb.gain.setTargetAtTime(0, this.ac.currentTime, 0.3);
  };
  blip(force) {
    if ((!this.state.sound && !force) || !this.ac) return;
    const t = this.ac.currentTime, o = this.ac.createOscillator(), g = this.ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(760, t); o.frequency.exponentialRampToValueAtTime(430, t + 0.09);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.07, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
    o.connect(g); g.connect(this.ac.destination); o.start(t); o.stop(t + 0.17);
  }
  pickBook(i) { if (this.state.book !== i) this.setState({ book: i }); }

  // ---- panel contents ----
  renderSide(key, name) {
    const st = this.state;
    if (key === 'pc') return html`
      <p class="lead">Side projects and school builds. Most started as a problem someone near me had.</p>
      <div class="col" style="gap:16px">
        ${PROJECTS.map(pr => html`
          <div class="proj">
            <div class="proj-bar">
              <div class="proj-lights"><span style="background:#D9734E"></span><span style="background:#E2B04A"></span><span style="background:#8FA88A"></span></div>
              <span class="proj-file">${pr.file}</span>
              <span class="proj-status" style=${{ background: pr.sBg, color: pr.sFg }}>${pr.status}</span>
            </div>
            ${pr.img && html`<img class="proj-shot" src=${pr.img} alt=${pr.name + ' screenshot'} />`}
            <div class="proj-body">
              <h3>${pr.name}</h3>
              <p>${pr.desc}</p>
              <div class="wrap">${pr.tech.map(t => html`<span class="chip">${t}</span>`)}</div>
              ${(pr.gh || pr.demo) && html`<div class="proj-links">
                ${pr.gh && html`<a href=${pr.gh} target="_blank" rel="noopener" class="btn-ghost">GitHub ↗</a>`}
                ${pr.demo && html`<a href=${pr.demo} target="_blank" rel="noopener" class="btn-dark">${pr.demoLabel || 'Live demo'} ↗</a>`}
              </div>`}
            </div>
          </div>`)}
      </div>`;

    if (key === 'desk') return html`
      <p style="margin:0; font-size:17px; line-height:1.6; text-wrap:pretty">I'm ${name}, a third-year Computer Science student. I like building small, useful web apps for the people around me, and I care a lot about how things feel to use.</p>
      <div class="facts">
        <div class="card">
          <div class="cap">EDUCATION</div>
          <div class="fact-t">BS Computer Science</div>
          <div class="fact-d">University of Caloocan City – Congressional Campus</div>
        </div>
        <div class="card">
          <div class="cap">RIGHT NOW</div>
          <div class="fact-t">Third-year student</div>
          <div class="fact-d" style="display:flex; align-items:center; gap:6px"><span style="width:7px; height:7px; border-radius:50%; background:#6E9C5E"></span>Open to internships</div>
        </div>
      </div>
      <div class="cap" style="margin:24px 0 10px">INTERESTS</div>
      <div class="wrap">${ABOUT.interests.map(t => html`<span style="font-size:13.5px; padding:6px 11px; border-radius:999px; background:#F1E9DC">${t}</span>`)}</div>
      <div class="cap sec">I WORK WITH</div>
      <div class="wrap">${ABOUT.tech.map(t => html`<span style="font-family:var(--f-mono); font-size:11.5px; padding:6px 10px; border-radius:6px; border:1px solid rgba(43,38,34,.16)">${t}</span>`)}</div>
      <div class="cap sec">CURRENTLY LEARNING</div>
      <div class="col" style="gap:8px">${LEARNING.map(l => html`
        <div style="display:flex; gap:10px; font-size:14.5px; line-height:1.45"><span style="color:var(--rust); font-weight:600">→</span><span><strong style="font-weight:600">${l.t}</strong> <span style="color:var(--muted)">${l.d}</span></span></div>`)}
      </div>`;

    if (key === 'shelf') {
      const sk = SKILLS[st.book];
      return html`
        <p class="lead" style="margin-bottom:16px">Hover a book to pull it off the shelf. You can do the same on the real shelf in the room.</p>
        <div class="shelf">
          ${SKILLS.map((b, i) => html`<div class="book" title=${b.name} onMouseEnter=${() => this.pickBook(i)} onClick=${() => this.pickBook(i)}
            style=${{ height: Math.round(b.h * 1.55) + 'px', background: b.c, transform: `translateY(${i === st.book ? -18 : 0}px)` }}></div>`)}
        </div>
        <div class="card" style="margin-top:14px; padding:16px; display:flex; gap:14px; align-items:flex-start">
          <div style=${{ flex: 'none', width: '12px', height: '52px', borderRadius: '2px', background: sk.c }}></div>
          <div>
            <div class="cap">${sk.cat}</div>
            <div style="font-family:var(--f-head); font-weight:700; font-size:22px; margin-top:2px">${sk.name}</div>
            <div style="font-size:14.5px; color:var(--ink-2); line-height:1.5; margin-top:4px">${sk.note}</div>
          </div>
        </div>
        <div class="col" style="margin-top:22px; gap:14px">
          ${['FRONTEND', 'BACKEND', 'TOOLS', 'SCHOOL'].map(c => html`
            <div class="cat-row"><span class="cap">${c}</span><span style="font-size:15px">${SKILLS.filter(s => s.cat === c).map(s => s.name).join(' · ')}</span></div>`)}
        </div>`;
    }

    if (key === 'calendar') return html`
      <div class="col">${TIMELINE.map(t => html`
        <div class="tl">
          <div class="tl-y" style=${{ color: t.now ? '#B5532F' : '#2B2622' }}>${t.y}</div>
          <div class="tl-rail"><span class="tl-dot" style=${{ background: t.now ? '#D9734E' : '#FBF7F0', boxShadow: `0 0 0 3px ${t.now ? 'rgba(217,115,78,.25)' : 'rgba(43,38,34,.25)'}` }}></span><span class="tl-line"></span></div>
          <div style="padding-bottom:22px">
            <div style="font-weight:600; font-size:16px; line-height:1.35">${t.t}</div>
            <div style="font-size:14.5px; color:var(--muted); line-height:1.5; margin-top:3px; text-wrap:pretty">${t.d}</div>
          </div>
        </div>`)}
      </div>`;
    return null;
  }

  renderModal(key, name, night) {
    const st = this.state;
    if (key === 'bed') return html`
      <p style="margin:0; font-family:var(--f-head); font-size:22px; font-weight:600; letter-spacing:-.01em">Hey, I'm ${name}.</p>
      <p style="margin:10px 0 0; font-size:16px; line-height:1.6; color:var(--ink-2); text-wrap:pretty">I'm a third-year Computer Science student at the University of Caloocan City – Congressional Campus. This is my room, where I study, build side projects, and occasionally sleep.</p>
      <p style="margin:10px 0 0; font-size:16px; line-height:1.6; color:var(--ink-2)">Look around. Everything in here tells you something about me.</p>
      <div class="wrap" style="gap:8px; margin-top:18px">
        <button class="btn btn-dark" onClick=${() => this.open('pc')}>See my projects</button>
        <button class="btn btn-ghost" onClick=${() => this.open('desk')}>About me</button>
        <button class="btn btn-ghost" onClick=${() => this.open('phone')}>Say hi</button>
      </div>`;

    if (key === 'phone') return html`
      <p class="lead" style="margin-bottom:14px">Internships, collabs, or just a hello. Email is the fastest way to reach me.</p>
      <div class="card col" style="overflow:hidden">${CONTACTS.map(c => html`
        <${c.href ? 'a' : 'div'} class=${c.href ? 'contact' : 'contact static'} href=${c.href}
          target=${c.href && c.href.startsWith('http') ? '_blank' : undefined} rel=${c.href && c.href.startsWith('http') ? 'noopener' : undefined}>
          <span style="font-weight:600; font-size:15px; flex:none">${c.name}</span>
          <span style="font-family:var(--f-mono); font-size:12px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0">${c.handle}${c.href ? ' ↗' : ''}</span>
        <//>`)}
      </div>`;

    if (key === 'drawer') return html`
      <div class="note"><p style="margin:0; font-size:19px; line-height:1.5; font-weight:500; text-wrap:pretty">${FACTS[st.fact % FACTS.length]}</p></div>
      <button class="btn btn-ghost" style="margin-top:18px" onClick=${this.nextFact}>Dig for another →</button>`;

    if (key === 'window') return html`
      <div style="display:flex; align-items:center; gap:10px; padding:12px 14px; border-radius:10px; background:#F1E9DC; font-size:14px; line-height:1.45">
        <span style="flex:none; width:8px; height:8px; border-radius:50%; background:#6E9C5E"></span>
        ${night ? 'Late night. Midterms season, still shipping side projects.' : 'Midterms season, still shipping side projects at night.'}
      </div>
      <div class="col" style="gap:14px; margin-top:18px">${LEARNING.map(l => html`
        <div><div style="font-weight:600; font-size:16px">${l.t}</div><div style="font-size:14.5px; color:var(--muted); line-height:1.5; margin-top:2px">${l.d}</div></div>`)}
      </div>`;

    if (key === 'headphones') return html`
      <p class="lead" style="margin-bottom:14px">What's playing while I code.</p>
      <div class="col" style="gap:4px">${MUSIC.map((s, i) => html`
        <div class="track">
          <span class="cap" style="letter-spacing:0; font-size:11px">${String(i + 1).padStart(2, '0')}</span>
          <div><div style="font-weight:600; font-size:15px">${s.t}</div><div style="font-size:13px; color:var(--muted)">${s.a}</div></div>
          <span class="cap" style="letter-spacing:0; font-size:11px">${s.d}</span>
        </div>`)}
      </div>`;

    if (key === 'polaroids') return html`
      <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:16px; padding-top:6px">${MOMENTS.map(mo => html`
        <div class="polaroid" style=${{ transform: `rotate(${mo.r}deg)` }}>
          <div class="polaroid-img"><span style="font-family:var(--f-mono); font-size:10px; color:var(--faint)">photo</span></div>
          <div style="font-size:13.5px; margin-top:8px; text-align:center; color:var(--ink-2)">${mo.c}</div>
        </div>`)}
      </div>`;

    if (key === 'posters') return html`
      <div class="col" style="gap:10px">${ACH.map(a => html`
        <div class="card" style="display:flex; gap:14px; padding:14px; border-color:rgba(43,38,34,.1)">
          <span style=${{ flex: 'none', width: '10px', borderRadius: '2px', background: a.c }}></span>
          <div>
            <div class="cap">${a.k}</div>
            <div style="font-weight:600; font-size:16px; margin-top:2px">${a.t}</div>
            <div style="font-size:14px; color:var(--muted); line-height:1.5; margin-top:2px">${a.d}</div>
          </div>
        </div>`)}
      </div>`;

    if (key === 'help') return html`
      <p class="lead" style="margin-bottom:14px">Drag to look around and scroll to zoom. Objects glow when you point at them; click one to walk over. Or jump straight there:</p>
      <div class="guide">${Object.keys(OBJ).map(k => html`
        <button onClick=${() => this.open(k)}>
          <div class="kicker" style="font-size:10.5px; letter-spacing:.12em">${OBJ[k].title}</div>
          <div style="font-size:13.5px; margin-top:2px">${OBJ[k].cta}</div>
        </button>`)}
      </div>`;
    return null;
  }

  render(_, st) {
    const night = this.isNight(), mobile = st.vw < 820;
    const name = CONFIG.ownerName || 'Your Name';
    const ho = OBJ[st.hover || st.lastHover];
    const sideKey = st.active && st.active !== 'help' && OBJ[st.active].kind === 'side' ? st.active : st.lastSide;
    const modalKey = st.active && (st.active === 'help' || OBJ[st.active].kind === 'modal') ? st.active : st.lastModal;
    const sideOpen = !!st.active && st.active === sideKey, modalOpen = !!st.active && st.active === modalKey;
    const side = OBJ[sideKey], modal = modalKey === 'help' ? HELP : OBJ[modalKey];
    const dotsOn = (st.ready && !st.active && (mobile || CONFIG.showHotspots)) || st.active === 'help';
    const sndC = st.sound ? '#B5532F' : '#B8ADA2';
    const modalStyle = {
      left: mobile ? '12px' : 'auto', right: mobile ? '12px' : '24px', top: mobile ? 'auto' : '50%', bottom: mobile ? '12px' : 'auto',
      width: mobile ? 'auto' : 'min(440px, calc(100vw - 48px))', maxHeight: mobile ? '58vh' : 'calc(100vh - 120px)',
      transform: mobile ? (modalOpen ? 'none' : 'translateY(24px)') : (modalOpen ? 'translateY(-50%)' : 'translateY(-50%) translateX(24px)'),
      opacity: modalOpen ? 1 : 0, pointerEvents: modalOpen ? 'auto' : 'none',
    };

    return html`
      <div class="root">
        <div class="mount" ref=${el => (this.mountEl = el)}></div>
        <div class="dots" ref=${el => (this.dotsEl = el)} style=${{ opacity: dotsOn ? 1 : 0 }}></div>
        <div class="label" ref=${el => (this.labelEl = el)}
          style=${{ opacity: st.hover && !st.active ? 1 : 0, transform: `translate(-50%, -100%) translateY(${st.hover ? -6 : 0}px)` }}>
          <div class="label-title">${ho.title}</div>
          <div class="label-cta">${st.bookName ? st.bookName + ' · browse my stack →' : ho.cta}</div>
        </div>
        <div class="loader" style=${{ opacity: st.ready ? 0 : 1, pointerEvents: st.ready ? 'none' : 'auto' }}>
          <span class="loader-badge">302</span>
          <span class="loader-text">${st.err ? "The 3D room couldn't load. Check your connection and refresh." : 'Unlocking Room 302…'}</span>
        </div>

        <div class="topbar">
          <button class="brand" onClick=${this.reset} title="Reset room">
            <span class="brand-badge">302</span><span class="brand-name">Room 302</span>
          </button>
          <div class="tools">
            <button class="tool" onClick=${this.reset} title="Reset room" aria-label="Reset room">
              <span class="ic-reset"></span>${!mobile && html`<span>Reset</span>`}
            </button>
            <button class="tool" onClick=${this.toggleMode} title="Day / night" aria-label="Toggle day and night">
              <span class=${night ? 'ic-moon' : 'ic-sun'}></span>${!mobile && html`<span>${night ? 'Night' : 'Day'}</span>`}
            </button>
            <button class="tool" onClick=${this.toggleSound} title="Sound" aria-label="Toggle sound" aria-pressed=${st.sound}>
              <span class="ic-snd"><span style=${{ height: '5px', background: sndC }}></span><span style=${{ height: '12px', background: sndC }}></span><span style=${{ height: '8px', background: sndC }}></span></span>
              ${!mobile && html`<span>${st.sound ? 'Sound on' : 'Sound off'}</span>`}
            </button>
            <button class="tool-help" onClick=${() => this.open('help')} title="How to explore" aria-label="How to explore">?</button>
          </div>
        </div>

        <div class="hint">
          <div class="hint-title">explore the room</div>
          <div class="hint-sub">${mobile ? 'drag to look around · tap objects' : 'drag to look around · click objects to discover more'}</div>
        </div>

        <div class="scrim" onClick=${this.close} style=${{ opacity: st.active ? 1 : 0, pointerEvents: st.active ? 'auto' : 'none' }}></div>

        <aside class="side" aria-hidden=${!sideOpen} style=${{ transform: `translateX(${sideOpen ? '0' : 'calc(100% + 32px)'})` }}>
          <div class="side-head">
            <div class="head-text"><div class="kicker">${side.kicker}</div><h2 class="h2">${side.heading}</h2></div>
            <button class="close" onClick=${this.close} title="Close" aria-label="Close">×</button>
          </div>
          <div class="side-body">${this.renderSide(sideKey, name)}</div>
        </aside>

        <div class="modal" role="dialog" aria-hidden=${!modalOpen} style=${modalStyle}>
          <div class="modal-head">
            <div class="head-text"><div class="kicker">${modal.kicker}</div><h2 class="h2">${modal.heading}</h2></div>
            <button class="close" onClick=${this.close} title="Close" aria-label="Close">×</button>
          </div>
          <div class="modal-body">${this.renderModal(modalKey, name, night)}</div>
        </div>
      </div>`;
  }
}

render(html`<${App} />`, document.getElementById('app'));

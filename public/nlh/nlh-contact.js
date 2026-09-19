/* nlh-contact — shared lead form for every NhiLe website.
 *
 * <nlh-contact site="nlt" lang="vi" topics="Tình nguyện|Hợp tác|Khác"></nlh-contact>
 *
 * Posts to the NhiLe Leads Apps Script (Google Sheet + email to contact@nhi.sg).
 * Never shows a fake success: on any failure the visitor keeps their text and
 * gets a one-click email fallback to contact@nhi.sg.
 * Styling reads the NLH design tokens (inherited CSS variables) with fallbacks.
 */
(function () {
  'use strict';
  if (customElements.get('nlh-contact')) return;

  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbzG2THjkAqFQNFF4IWjIJOMcb9hkwrQ7AYewI1h3iHKuvxsINR7Y_02DfH5IN5fZKnwGw/exec';
  var TEAM_EMAIL = 'contact@nhi.sg';

  // Keep first-touch UTM/referrer for the whole visit, even after navigation.
  try {
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (k) {
      if (q.get(k) && !sessionStorage.getItem('nlh_' + k)) sessionStorage.setItem('nlh_' + k, q.get(k));
    });
    if (!sessionStorage.getItem('nlh_referrer')) sessionStorage.setItem('nlh_referrer', document.referrer || '(direct)');
  } catch (e) { /* storage blocked: ignore */ }

  var T = {
    vi: {
      title: 'Để lại thông tin, chúng tôi sẽ liên hệ lại',
      lead: 'Điền vài dòng, team NhiLe sẽ liên hệ bạn trong 1–2 ngày làm việc.',
      name: 'Họ và tên', email: 'Email', phone: 'Số điện thoại', country: 'Quốc gia',
      channel: 'Bạn muốn được liên hệ qua', topic: 'Bạn quan tâm đến', org: 'Công ty / tổ chức (không bắt buộc)',
      message: 'Nội dung (không bắt buộc)', bestTime: 'Thời gian thuận tiện (không bắt buộc)',
      bestTimePh: 'VD: tối thứ 3, sau 19h', contactHint: 'Cần ít nhất email hoặc số điện thoại.',
      consent: 'Tôi đồng ý để NhiLe lưu và dùng thông tin này để liên hệ lại với tôi.',
      send: 'Gửi thông tin', sending: 'Đang gửi…',
      okTitle: 'Đã nhận thông tin của bạn', okBody: 'Cảm ơn bạn. Mã của bạn là {id}. Team sẽ liên hệ trong 1–2 ngày làm việc.',
      errTitle: 'Chưa gửi được', errBody: 'Đường truyền đang gặp sự cố. Thông tin bạn nhập vẫn còn nguyên — bấm nút dưới để gửi bằng email, hoặc thử lại.',
      errMail: 'Gửi bằng email', retry: 'Thử lại',
      needName: 'Vui lòng nhập họ tên.', needContact: 'Vui lòng nhập email hoặc số điện thoại.',
      badEmail: 'Email chưa đúng định dạng.', needConsent: 'Vui lòng đánh dấu đồng ý để chúng tôi liên hệ lại.',
      channels: ['Zalo', 'Gọi điện', 'Email', 'WhatsApp', 'Telegram', 'Facebook Messenger'],
      countries: ['Việt Nam', 'Singapore', 'Úc', 'Mỹ', 'Canada', 'Nhật Bản', 'Hàn Quốc', 'Đức', 'Anh', 'Pháp', 'Khác'],
      defaultCountry: 'Việt Nam', defaultChannel: 'Zalo', other: 'Khác'
    },
    en: {
      title: 'Leave your details and we will get back to you',
      lead: 'A few lines is enough. The NhiLe team replies within 1–2 working days.',
      name: 'Full name', email: 'Email', phone: 'Phone / WhatsApp', country: 'Country',
      channel: 'Best way to reach you', topic: 'What is this about?', org: 'Company / organisation (optional)',
      message: 'Message (optional)', bestTime: 'Best time to contact you (optional)',
      bestTimePh: 'e.g. weekdays after 6 pm', contactHint: 'Please give at least an email or a phone number.',
      consent: 'I agree that NhiLe may store and use these details to contact me.',
      send: 'Send', sending: 'Sending…',
      okTitle: 'Thank you — we have your message', okBody: 'Your reference is {id}. We will get back to you within 1–2 working days.',
      errTitle: 'Not sent yet', errBody: 'Something went wrong on our side. Your details are still here — send them by email with the button below, or try again.',
      errMail: 'Send by email', retry: 'Try again',
      needName: 'Please enter your name.', needContact: 'Please give an email or a phone number.',
      badEmail: 'Please check the email address.', needConsent: 'Please tick the consent box so we can contact you.',
      channels: ['Email', 'WhatsApp', 'Phone call', 'Zalo', 'Telegram', 'LinkedIn'],
      countries: ['Singapore', 'Vietnam', 'Australia', 'United States', 'Canada', 'Japan', 'South Korea', 'Germany', 'United Kingdom', 'France', 'Other'],
      defaultCountry: '', defaultChannel: 'Email', other: 'Other'
    }
  };

  var CSS = '\
:host{display:block;font-family:var(--font-ui,system-ui,sans-serif);color:var(--text-primary,#1d1d1f)}\
.card{border:1px solid var(--line-hairline,#e8e8ed);border-radius:var(--r-lg,20px);background:var(--bg-raised,#fff);padding:var(--s-6,32px);max-width:720px;margin:0 auto;box-sizing:border-box}\
h2{font-family:var(--font-display,Georgia,serif);font-size:var(--size-title,28px);line-height:var(--lh-title,1.2);margin:0 0 var(--s-2,8px)}\
.lead{margin:0 0 var(--s-5,24px);color:var(--text-secondary,#474749);font-size:var(--size-body,17px)}\
form{display:grid;grid-template-columns:1fr 1fr;gap:var(--s-4,16px)}\
.full{grid-column:1/-1}\
label{display:grid;gap:var(--s-1,4px);font-size:var(--size-small,14px);font-weight:600;color:var(--text-secondary,#474749)}\
input,select,textarea{font:inherit;font-size:16px;font-weight:400;color:var(--text-primary,#1d1d1f);background:var(--bg-base,#fff);border:1px solid var(--line-strong,#d2d2d7);border-radius:var(--r-sm,10px);padding:10px 12px;min-height:44px;width:100%;box-sizing:border-box}\
textarea{min-height:110px;resize:vertical}\
input:focus,select:focus,textarea:focus{outline:3px solid var(--focus-ring,rgba(223,0,41,.4));outline-offset:1px;border-color:var(--action,#df0029)}\
.phone{display:grid;grid-template-columns:110px 1fr;gap:var(--s-2,8px)}\
.hint{grid-column:1/-1;margin:-8px 0 0;font-size:var(--size-caption,12px);color:var(--text-tertiary,#6b6b6f)}\
.consent{display:flex;gap:var(--s-2,8px);align-items:flex-start;font-weight:400}\
.consent input{width:20px;min-height:20px;height:20px;margin-top:2px;flex:none}\
.hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}\
button,.btn{font:inherit;font-weight:600;font-size:var(--size-body,17px);min-height:44px;padding:0 var(--s-5,24px);border-radius:var(--r-pill,980px);border:0;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}\
.primary{background:var(--action,#df0029);color:var(--action-on,#fff)}\
.primary[disabled]{opacity:.6;cursor:progress}\
.quiet{background:transparent;color:var(--text-primary,#1d1d1f);border:1px solid var(--line-strong,#d2d2d7)}\
.actions{grid-column:1/-1;display:flex;flex-wrap:wrap;gap:var(--s-3,12px);align-items:center}\
.err{grid-column:1/-1;color:var(--state-error,#d70015);font-size:var(--size-small,14px);margin:0}\
.status{border-radius:var(--r-md,14px);padding:var(--s-5,24px);background:var(--bg-sunken,#f5f5f7)}\
.status h3{margin:0 0 var(--s-2,8px);font-size:var(--size-lead,21px)}\
.status p{margin:0 0 var(--s-4,16px);color:var(--text-secondary,#474749)}\
@media (max-width:640px){form{grid-template-columns:1fr}.card{padding:var(--s-5,24px)}}';

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k]; else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function options(sel, list, selected) {
    list.forEach(function (v) {
      var o = el('option', { value: v, text: v });
      if (v === selected) o.selected = true;
      sel.appendChild(o);
    });
    return sel;
  }

  class NlhContact extends HTMLElement {
    static get observedAttributes() { return ['lang']; }

    attributeChangedCallback() { if (this._ready) this.setup(); }

    disconnectedCallback() { if (this._obs) this._obs.disconnect(); }

    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this.root = this.attachShadow({ mode: 'open' });
      var self = this;
      // Bilingual sites switch <html lang>; follow it unless this element sets its own lang.
      if (!this.hasAttribute('lang') && window.MutationObserver) {
        this._obs = new MutationObserver(function () { self.setup(); });
        this._obs.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
      }
      this.setup();
    }

    setup() {
      var lg = (this.getAttribute('lang') || document.documentElement.lang || 'vi').slice(0, 2) === 'en' ? 'en' : 'vi';
      if (lg === this.lg) return;
      if (this.form) this.saveDraft();
      this.lg = lg;
      this.t = T[this.lg];
      this.site = this.getAttribute('site') || location.hostname;
      this.endpoint = this.getAttribute('endpoint') || ENDPOINT;
      this.topics = (this.getAttribute('topics-' + lg) || this.getAttribute('topics') || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      this.draftKey = 'nlh_contact_draft_' + this.site;
      this.render();
    }

    render() {
      var t = this.t, self = this;
      this.root.innerHTML = '';
      this.root.appendChild(el('style', { text: CSS }));
      var card = el('div', { class: 'card' });
      if (!this.hasAttribute('no-heading')) {
        card.appendChild(el('h2', { text: this.getAttribute('heading') || t.title }));
        card.appendChild(el('p', { class: 'lead', text: t.lead }));
      }
      var f = el('form', { novalidate: '' });
      var field = function (label, input, cls) { return el('label', cls ? { class: cls } : {}, [document.createTextNode(label), input]); };

      this.in = {
        name: el('input', { name: 'name', autocomplete: 'name', required: '' }),
        email: el('input', { name: 'email', type: 'email', autocomplete: 'email', inputmode: 'email' }),
        code: options(el('select', { name: 'code', 'aria-label': 'Country code' }), ['+84', '+65', '+61', '+1', '+81', '+82', '+49', '+44', '+33', '+60', '+66', '+62', '+63', '+86', '+852', '+886', '+971'], this.lg === 'vi' ? '+84' : '+65'),
        phone: el('input', { name: 'phone', type: 'tel', autocomplete: 'tel-national', inputmode: 'tel' }),
        country: options(el('select', { name: 'country' }), [''].concat(t.countries), t.defaultCountry),
        channel: options(el('select', { name: 'channel' }), t.channels, t.defaultChannel),
        topic: this.topics.length ? options(el('select', { name: 'topic' }), this.topics.concat([t.other]), this.topics[0]) : null,
        org: el('input', { name: 'organisation', autocomplete: 'organization' }),
        bestTime: el('input', { name: 'bestTime', placeholder: t.bestTimePh }),
        message: el('textarea', { name: 'message', rows: '4' }),
        consent: el('input', { type: 'checkbox', name: 'consent' }),
        website: el('input', { name: 'website', tabindex: '-1', autocomplete: 'off' })
      };
      var i = this.in;
      f.appendChild(field(t.name + ' *', i.name, 'full'));
      f.appendChild(field(t.email, i.email));
      f.appendChild(el('label', {}, [document.createTextNode(t.phone), el('div', { class: 'phone' }, [i.code, i.phone])]));
      f.appendChild(el('p', { class: 'hint', text: t.contactHint }));
      f.appendChild(field(t.channel, i.channel));
      f.appendChild(field(t.country, i.country));
      if (i.topic) f.appendChild(field(t.topic, i.topic, 'full'));
      f.appendChild(field(t.org, i.org));
      f.appendChild(field(t.bestTime, i.bestTime));
      f.appendChild(field(t.message, i.message, 'full'));
      f.appendChild(el('label', { class: 'consent full' }, [i.consent, document.createTextNode(t.consent)]));
      f.appendChild(el('div', { class: 'hp', 'aria-hidden': 'true' }, [i.website]));
      this.errEl = el('p', { class: 'err', role: 'alert' });
      f.appendChild(this.errEl);
      this.btn = el('button', { type: 'submit', class: 'primary', text: t.send });
      f.appendChild(el('div', { class: 'actions' }, [this.btn]));
      f.addEventListener('submit', function (ev) { ev.preventDefault(); self.submit(); });
      f.addEventListener('input', function () { self.saveDraft(); });
      card.appendChild(f);
      this.form = f;
      this.card = card;
      this.root.appendChild(card);
      this.startedAt = Date.now();
      this.loadDraft();
    }

    values() {
      var i = this.in, phone = i.phone.value.trim();
      if (phone && phone.charAt(0) !== '+') phone = i.code.value + ' ' + phone.replace(/^0+/, '');
      var ss = function (k) { try { return sessionStorage.getItem('nlh_' + k) || ''; } catch (e) { return ''; } };
      return {
        site: this.site, lang: this.lg,
        name: i.name.value.trim(), email: i.email.value.trim(), phone: phone,
        channel: i.channel.value, country: i.country.value, topic: i.topic ? i.topic.value : '',
        organisation: i.org.value.trim(), bestTime: i.bestTime.value.trim(), message: i.message.value.trim(),
        consent: i.consent.checked, website: i.website.value,
        timeZone: (Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
        page: location.href, referrer: ss('referrer'),
        utm_source: ss('utm_source'), utm_medium: ss('utm_medium'), utm_campaign: ss('utm_campaign'),
        userAgent: navigator.userAgent, elapsedMs: Date.now() - this.startedAt
      };
    }

    validate(v) {
      var t = this.t;
      if (!v.name) return t.needName;
      if (!v.email && !this.in.phone.value.trim()) return t.needContact;
      if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) return t.badEmail;
      if (!v.consent) return t.needConsent;
      return '';
    }

    submit() {
      var v = this.values(), msg = this.validate(v), self = this;
      this.errEl.textContent = msg;
      if (msg) return;
      this.btn.disabled = true;
      this.btn.textContent = this.t.sending;
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // no CORS preflight for Apps Script
        body: JSON.stringify(v),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) { return r.json(); }).then(function (res) {
        clearTimeout(timer);
        if (res && res.ok) { self.clearDraft(); self.done(res.id); } else { self.fail(v); }
      }).catch(function () { clearTimeout(timer); self.fail(v); });
    }

    done(id) {
      var t = this.t;
      this.form.replaceWith(el('div', { class: 'status', role: 'status' }, [
        el('h3', { text: t.okTitle }), el('p', { text: t.okBody.replace('{id}', id || '') })
      ]));
      try { window.dispatchEvent(new CustomEvent('nlh-lead', { detail: { site: this.site, id: id } })); } catch (e) {}
    }

    fail(v) {
      var t = this.t, self = this;
      this.btn.disabled = false;
      this.btn.textContent = t.send;
      var body = [
        t.name + ': ' + v.name, t.email + ': ' + v.email, t.phone + ': ' + v.phone,
        t.channel + ': ' + v.channel, t.country + ': ' + v.country, t.topic + ': ' + v.topic,
        t.org + ': ' + v.organisation, t.bestTime + ': ' + v.bestTime, '', v.message, '', '— ' + v.site + ' · ' + v.page
      ].join('\n');
      var href = 'mailto:' + TEAM_EMAIL + '?subject=' + encodeURIComponent('[Lead] ' + v.site + ' · ' + (v.topic || '') + ' · ' + v.name) + '&body=' + encodeURIComponent(body);
      var box = el('div', { class: 'status full', role: 'alert' }, [
        el('h3', { text: t.errTitle }), el('p', { text: t.errBody }),
        el('div', { class: 'actions' }, [el('a', { class: 'btn primary', href: href, text: t.errMail })])
      ]);
      var old = this.form.querySelector('.status');
      if (old) old.remove();
      this.form.insertBefore(box, this.form.querySelector('.actions'));
      this.btn.textContent = t.retry;
      self.saveDraft();
    }

    saveDraft() {
      try {
        var i = this.in, d = {};
        ['name', 'email', 'phone', 'org', 'bestTime', 'message'].forEach(function (k) { d[k] = i[k].value; });
        localStorage.setItem(this.draftKey, JSON.stringify(d));
      } catch (e) {}
    }

    loadDraft() {
      try {
        var d = JSON.parse(localStorage.getItem(this.draftKey) || 'null'), i = this.in;
        if (d) Object.keys(d).forEach(function (k) { if (i[k] && d[k]) i[k].value = d[k]; });
      } catch (e) {}
    }

    clearDraft() { try { localStorage.removeItem(this.draftKey); } catch (e) {} }
  }

  customElements.define('nlh-contact', NlhContact);
})();

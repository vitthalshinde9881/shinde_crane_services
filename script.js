document.addEventListener('DOMContentLoaded', function () {
	// Set your WhatsApp number here in international format without + or spaces.
	// Example for an Indian number: '919876543210'
	const ADMIN_PHONE = '917218138763';
	// Mobile nav toggle
	const navToggle = document.querySelector('.nav-toggle');
	const mainNav = document.querySelector('.main-nav');
	if (navToggle && mainNav) {
		navToggle.addEventListener('click', function () {
			const expanded = navToggle.getAttribute('aria-expanded') === 'true';
			navToggle.setAttribute('aria-expanded', (!expanded).toString());
			mainNav.classList.toggle('open');
		});
	}
	const galleryLinks = Array.from(document.querySelectorAll('.gallery-item a'));
	const lightbox = document.getElementById('lightbox');
	const lbImage = lightbox.querySelector('.lightbox-content img');
	const lbCaption = lightbox.querySelector('.lightbox-caption');
	const btnClose = lightbox.querySelector('.lightbox-close');
	const btnPrev = lightbox.querySelector('.lightbox-prev');
	const btnNext = lightbox.querySelector('.lightbox-next');

	let current = -1;

	function openLightbox(index) {
		const link = galleryLinks[index];
		if (!link) return;
		const imgSrc = link.getAttribute('href');
		const caption = link.querySelector('figcaption')?.textContent || '';
		lbImage.src = imgSrc;
		lbImage.alt = link.querySelector('img')?.alt || '';
		lbCaption.textContent = caption;
		lightbox.setAttribute('aria-hidden', 'false');
		document.body.style.overflow = 'hidden';
		current = index;
	}

	function closeLightbox() {
		lightbox.setAttribute('aria-hidden', 'true');
		lbImage.src = '';
		document.body.style.overflow = '';
		current = -1;
	}

	function showPrev() {
		if (current > 0) openLightbox(current - 1);
	}

	function showNext() {
		if (current < galleryLinks.length - 1) openLightbox(current + 1);
	}

	galleryLinks.forEach((link, i) => {
		link.addEventListener('click', function (e) {
			e.preventDefault();
			openLightbox(i);
		});
	});

	btnClose.addEventListener('click', closeLightbox);
	btnPrev.addEventListener('click', showPrev);
	btnNext.addEventListener('click', showNext);

	// close on overlay click
	lightbox.addEventListener('click', function (e) {
		if (e.target === lightbox) closeLightbox();
	});

	// keyboard
	document.addEventListener('keydown', function (e) {
		if (lightbox.getAttribute('aria-hidden') === 'false') {
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowLeft') showPrev();
			if (e.key === 'ArrowRight') showNext();
		}
	});

	// Side panel toggle for small screens
	const sideToggle = document.querySelector('.side-toggle');
	const sidePanel = document.querySelector('.side-panel');
	if (sideToggle && sidePanel) {
		sideToggle.addEventListener('click', function () {
			const expanded = sideToggle.getAttribute('aria-expanded') === 'true';
			sideToggle.setAttribute('aria-expanded', (!expanded).toString());
			sidePanel.classList.toggle('open');
		});
		// close when a link inside is clicked (helpful on mobile)
		sidePanel.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
			sidePanel.classList.remove('open');
			sideToggle.setAttribute('aria-expanded', 'false');
		}));
	}

	// Handle forms with data-whatsapp: submit to Formspree (AJAX) then open a pre-filled WhatsApp chat for the visitor to send
	document.querySelectorAll('form[data-whatsapp]').forEach(form => {
		form.addEventListener('submit', function (e) {
			e.preventDefault();

			const statusEl = form.querySelector('.form-status') || (function () {
				const el = document.createElement('div');
				el.className = 'form-status';
				el.setAttribute('aria-live', 'polite');
				form.appendChild(el);
				return el;
			})();

			statusEl.textContent = 'Sending...';

			const formData = new FormData(form);
			const action = form.getAttribute('action');

			fetch(action, {
				method: 'POST',
				body: formData,
				headers: {
					'Accept': 'application/json'
				}
			}).then(function (response) {
				if (response.ok) return response.json().catch(() => ({}));
				throw new Error('Network response was not ok.');
			}).then(function (data) {
				statusEl.textContent = 'Thanks — your booking was sent.';

				// build a friendly WhatsApp message from form fields
				const waNumber = form.getAttribute('data-whatsapp') || ADMIN_PHONE;
				let msgParts = [];
				for (const [key, value] of formData.entries()) {
					msgParts.push(`${key}: ${value}`);
				}
				const message = `New booking from website:\n${msgParts.join('\n')}`;
				const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

				// open WhatsApp in a new tab/window so the visitor can send the message to you
				window.open(waUrl, '_blank');

				// optionally, clear the form
				form.reset();
			}).catch(function (err) {
				statusEl.textContent = 'Sorry — there was a problem sending your booking.';
				console.error('Form submit error', err);
			});
		});
	});

	// Quick side-panel WhatsApp booking (opens visitor's WhatsApp with a pre-filled message)
	const sideBookForm = document.getElementById('side-book-form');
	if (sideBookForm) {
		sideBookForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const name = document.getElementById('side-name')?.value.trim() || '';
			const phone = document.getElementById('side-phone')?.value.trim() || '';
			const message = `New Quick Booking:\n\nName: ${name}\nPhone: ${phone}\nFrom: Side Panel Booking`;
			const waUrl = `https://wa.me/${ADMIN_PHONE}?text=${encodeURIComponent(message)}`;
			window.open(waUrl, '_blank');
			sideBookForm.reset();
		});
	}

	// Subscribe form (ajax submit to Formspree) — class: .subscribe-form
	const subscribeForm = document.querySelector('.subscribe-form');
	if (subscribeForm) {
		subscribeForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const statusEl = subscribeForm.querySelector('.form-status') || (function () {
				const el = document.createElement('div');
				el.className = 'form-status';
				el.setAttribute('aria-live', 'polite');
				subscribeForm.appendChild(el);
				return el;
			})();

			statusEl.textContent = 'Sending...';
			const formData = new FormData(subscribeForm);
			const action = subscribeForm.getAttribute('action');

			fetch(action, {
				method: 'POST',
				body: formData,
				headers: { 'Accept': 'application/json' }
			}).then(function (res) {
				if (res.ok) return res.json().catch(() => ({}));
				throw new Error('Network response was not ok');
			}).then(function () {
				statusEl.textContent = 'Thanks — we will send updates to your email.';
				subscribeForm.reset();
			}).catch(function (err) {
				statusEl.textContent = 'Sorry — could not subscribe right now.';
				console.error('Subscribe error', err);
			});
		});
	}

	// Alternate simple contact form (ajax submit) — class: .alt-form
	const altForm = document.querySelector('.alt-form');
	if (altForm) {
		altForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const statusEl = altForm.querySelector('.form-status') || (function () {
				const el = document.createElement('div');
				el.className = 'form-status';
				el.setAttribute('aria-live', 'polite');
				altForm.appendChild(el);
				return el;
			})();

			statusEl.textContent = 'Sending...';
			const formData = new FormData(altForm);
			const action = altForm.getAttribute('action');

			fetch(action, {
				method: 'POST',
				body: formData,
				headers: { 'Accept': 'application/json' }
			}).then(function (res) {
				if (res.ok) return res.json().catch(() => ({}));
				throw new Error('Network response was not ok');
			}).then(function () {
				statusEl.textContent = 'Thanks — your message was sent.';
				altForm.reset();
			}).catch(function (err) {
				statusEl.textContent = 'Sorry — could not send your message right now.';
				console.error('Alt form error', err);
			});
		});
	}
});

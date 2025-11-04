// Simple manifest-based loader: expects docs/manifest.js to set window.ICON_MANIFEST
function sanitizeSVG(svgText){
	// Remove width/height attributes and hard-coded fills/strokes so we can apply color/size safely.
	// Also strip any <script> tags that may be injected by live servers.
	return svgText
		.replace(/<script[\s\S]*?<\/script>/gi, '')
		.replace(/\s(width|height)="[^"]*"/g,'')
		.replace(/fill="(?!none)[^"]*"/g,'')
		.replace(/stroke="[^"]*"/g,'')
}

function setPreview(iconUrl, color, size) {
  console.log('setting preview with', {iconUrl, color, size});
  const image = document.createElement('img');
  image.src = iconUrl;
  image.style.width = size + 'px';
  image.style.height = 'auto';
  const preview = document.getElementById('preview');
  
  preview.appendChild(image);

	preview.style.color = color;
}

function makeDownloadedSVG(svgText, color, size){
	const cleaned = sanitizeSVG(svgText);
	const parser = new DOMParser();
	const doc = parser.parseFromString(cleaned, 'image/svg+xml');
	const svg = doc.querySelector('svg');
	if(!svg) return cleaned;

	svg.setAttribute('width', `${size}px`);
	svg.setAttribute('height', `${size}px`);
	svg.setAttribute('fill', color);

	const scripts = svg.querySelectorAll('script');
	scripts.forEach(s => s.remove());

	const serializer = new XMLSerializer();
	return serializer.serializeToString(svg);
}

async function loadManifest(){
	if(window.ICON_MANIFEST) return window.ICON_MANIFEST;
	return new Promise((resolve, reject)=>{
		const s = document.createElement('script');
		s.src = 'manifest.js';
		s.onload = ()=>{
			if(window.ICON_MANIFEST) resolve(window.ICON_MANIFEST);
			else reject(new Error('manifest loaded but ICON_MANIFEST not set'));
		};
		s.onerror = ()=>reject(new Error('Failed to load manifest.js'));
		document.head.appendChild(s);
		// safety timeout
		setTimeout(()=>{
			if(window.ICON_MANIFEST) resolve(window.ICON_MANIFEST);
		}, 3000);
	});
}

async function mount(){
	const catSel = document.getElementById('category');
	const iconSel = document.getElementById('icon');
	const sizeInput = document.getElementById('size');
	const sizeValue = document.getElementById('sizeValue');
	const colorInput = document.getElementById('color');
	const copyBtn = document.getElementById('copyBtn');
	const downloadBtn = document.getElementById('downloadBtn');

	// initial UI
	document.getElementById('preview').innerHTML = '<p class="help">Choose a category and an icon to preview.</p>';

	let manifest;
	try{
		manifest = await loadManifest();
	}catch(e){
		console.error(e);
		document.getElementById('preview').innerHTML = '<p class="help" style="color:#b91c1c">Failed to load manifest.js</p>';
		return;
	}

	const categories = Object.keys(manifest).sort();
	categories.forEach(cat => { const opt = document.createElement('option'); opt.value = cat; opt.textContent = cat; catSel.appendChild(opt); });

	function setIconOptions(cat){
		iconSel.innerHTML = '<option value="">Select icon</option>';
		if(!cat){ iconSel.disabled = true; return }
		const list = manifest[cat] || [];
		list.forEach(it => {
			const opt = document.createElement('option'); opt.value = it.path; opt.textContent = it.name; opt.dataset.filename = it.filename || it.name; iconSel.appendChild(opt);
		});
		iconSel.disabled = false;
	}

	catSel.addEventListener('change', ()=>{
		setIconOptions(catSel.value);
		document.getElementById('preview').innerHTML = '<p class="help">Choose a category and an icon to preview.</p>';
		copyBtn.disabled = true; downloadBtn.disabled = true;
	});

	let currentSVGText = null;

	iconSel.addEventListener('change', async ()=>{
    const path = iconSel.value;
    console.log('logging the path', path)
		if(!path) return;
		try{
      const r = await fetch(path);
      if (!r.ok) throw new Error('Failed to load ' + path);
      
      let iconUrl = r.url;
			
			const size = Number(sizeInput.value);
			const color = colorInput.value;
			setPreview(iconUrl, color, size);
      copyBtn.disabled = false;
      downloadBtn.disabled = false;
		}catch(e){
			console.error(e);
			document.getElementById('preview').innerHTML = '<p class="help" style="color:#b91c1c">Error loading icon</p>';
			currentSVGText = null; copyBtn.disabled = true; downloadBtn.disabled = true;
		}
	});

	sizeInput.addEventListener('input', ()=>{
		const size = Number(sizeInput.value);
		sizeValue.textContent = String(size);
		if(currentSVGText) setPreview(currentSVGText, colorInput.value, size);
	});

	colorInput.addEventListener('input', ()=>{
		if(currentSVGText) setPreview(currentSVGText, colorInput.value, Number(sizeInput.value));
	});

	copyBtn.addEventListener('click', async ()=>{
		if(!currentSVGText) return;
		const size = Number(sizeInput.value);
		const color = colorInput.value;
		const out = makeDownloadedSVG(currentSVGText, color, size);
		try{ await navigator.clipboard.writeText(out); copyBtn.textContent='Copied'; setTimeout(()=>copyBtn.textContent='Copy SVG',900); }
		catch(e){ alert('Clipboard failed: '+e); }
	});

	downloadBtn.addEventListener('click', ()=>{
		if(!currentSVGText) return;
		const size = Number(sizeInput.value);
		const color = colorInput.value;
		const out = makeDownloadedSVG(currentSVGText, color, size);
		const blob = new Blob([out],{type:'image/svg+xml'});
		const a = document.createElement('a');
		const filename = (iconSel.selectedOptions[0] && iconSel.selectedOptions[0].dataset && iconSel.selectedOptions[0].dataset.filename) || 'icon.svg';
		a.href = URL.createObjectURL(blob);
		a.download = filename;
		document.body.appendChild(a); a.click(); a.remove();
	});
}

mount().catch(e=>{
	const preview = document.getElementById('preview');
	if(preview) preview.innerHTML = '<p style="color:#b91c1c">Initialization error: '+(e.message||e)+'</p>';
	console.error(e);
});

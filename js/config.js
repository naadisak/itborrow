// ── IT Borrow System — Shared Config ────────────────────────────
var CFG = {
  API_URL  : 'https://script.google.com/macros/s/AKfycbyb-Do-iYhboSkj3wDg4ZVstRTilaBV9UHvC3yiMmpKh95sfV3Kg2ZB3UzEH70-3dYFYA/exec',
  IMGBB_KEY: 'b37889052f6fd7b7143ff017d07914df'
};

function api(params) {
  var url = CFG.API_URL + '?' + Object.keys(params).map(function(k) {
    return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
  }).join('&') + '&_t=' + Date.now();
  return fetch(url).then(function(r) { return r.json(); });
}

function uploadToImgBB(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var base64 = e.target.result.split(',')[1];
      var fd = new FormData();
      fd.append('key', CFG.IMGBB_KEY);
      fd.append('image', base64);
      fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: fd })
        .then(function(r) { return r.json(); })
        .then(function(d) {
          if (d.success) resolve(d.data.url);
          else reject(new Error('ImgBB upload failed'));
        }).catch(reject);
    };
    reader.readAsDataURL(file);
  });
}

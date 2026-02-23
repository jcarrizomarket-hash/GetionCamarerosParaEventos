export function htmlFichajeOk({ accion, camareroNombre, clienteNombre, lugar, fechaStr, horaStr, horaEntradaPrevista, horaSalidaPrevista, fichajeUrl }: any) {
  const esEntrada = accion === 'entrada';
  const esCompleto = accion === 'ya_completo';
  const color = esEntrada ? '#16a34a' : esCompleto ? '#6366f1' : '#dc2626';
  const bgColor = esEntrada ? '#f0fdf4' : esCompleto ? '#eef2ff' : '#fef2f2';
  const borderColor = esEntrada ? '#bbf7d0' : esCompleto ? '#c7d2fe' : '#fecaca';
  const icon = esEntrada ? '🟢' : esCompleto ? '✅' : '🔴';
  const titulo = esEntrada ? '¡Entrada registrada!' : esCompleto ? 'Fichaje completo' : '¡Salida registrada!';
  const subtitulo = esEntrada
    ? 'Escaneá este QR de nuevo cuando salgas del evento.'
    : esCompleto
    ? 'Entrada y salida ya registradas. Gracias.'
    : 'Tu salida ha sido registrada correctamente.';

  const mostrarQR = esEntrada && fichajeUrl;

  const horaBadge = !esCompleto
    ? '<div class="hora-badge">' +
      '<div class="label">' + (esEntrada ? 'Hora de entrada' : 'Hora de salida') + '</div>' +
      '<div class="hora">' + horaStr + '</div>' +
      '</div>'
    : '';

  const qrSection = mostrarQR
    ? '<div class="qr-section">' +
      '<p class="qr-label">QR de salida</p>' +
      '<div id="qrcode"></div>' +
      '<p class="qr-hint">Mostrá este QR al escanear la salida</p>' +
      '</div>'
    : '';

  const qrScript = mostrarQR
    ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>' +
      '<script>new QRCode(document.getElementById("qrcode"),{text:"' + fichajeUrl + '",width:180,height:180,colorDark:"#1f2937",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M});<\/script>'
    : '';

  return '<!DOCTYPE html>' +
    '<html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Fichaje - ' + clienteNombre + '</title>' +
    '<style>' +
    '*{box-sizing:border-box;margin:0;padding:0}' +
    'body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:' + bgColor + ';display:flex;justify-content:center;min-height:100vh;padding:1.5rem}' +
    '.card{background:white;border-radius:20px;box-shadow:0 8px 32px rgba(0,0,0,0.12);max-width:420px;width:100%;overflow:hidden;border-top:6px solid ' + color + ';height:fit-content;margin:auto}' +
    '.header{padding:1.75rem;text-align:center;background:' + bgColor + ';border-bottom:1px solid ' + borderColor + '}' +
    '.icon{font-size:3.25rem;margin-bottom:0.5rem;display:block}' +
    '.titulo{color:' + color + ';font-size:1.4rem;font-weight:700}' +
    '.subtitulo{color:#6b7280;font-size:0.875rem;margin-top:4px;line-height:1.4}' +
    '.body{padding:1.5rem}' +
    '.hora-badge{background:' + bgColor + ';border:2px solid ' + borderColor + ';border-radius:14px;padding:1rem;text-align:center;margin-bottom:1.25rem}' +
    '.hora-badge .label{font-size:0.75rem;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}' +
    '.hora-badge .hora{font-size:2rem;font-weight:800;color:' + color + ';font-variant-numeric:tabular-nums}' +
    '.info{display:flex;flex-direction:column;gap:0.75rem}' +
    '.info-row{display:flex;align-items:flex-start;gap:0.75rem;padding:0.75rem;background:#f9fafb;border-radius:10px}' +
    '.emoji{font-size:1.25rem;flex-shrink:0}' +
    '.label{font-size:0.7rem;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:2px}' +
    '.value{font-size:0.9rem;font-weight:600;color:#1f2937}' +
    '.qr-section{margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid #e5e7eb;text-align:center}' +
    '.qr-label{font-size:0.8rem;color:#6b7280;margin-bottom:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em}' +
    '#qrcode{display:inline-block;padding:12px;background:white;border-radius:12px;border:2px solid #e5e7eb}' +
    '.qr-hint{font-size:0.75rem;color:#9ca3af;margin-top:0.75rem}' +
    '</style></head><body>' +
    '<div class="card">' +
    '<div class="header">' +
    '<span class="icon">' + icon + '</span>' +
    '<div class="titulo">' + titulo + '</div>' +
    '<div class="subtitulo">' + subtitulo + '</div>' +
    '</div>' +
    '<div class="body">' +
    horaBadge +
    '<div class="info">' +
    '<div class="info-row"><span class="emoji">👤</span><div><span class="label">Camarero</span><span class="value">' + camareroNombre + '</span></div></div>' +
    '<div class="info-row"><span class="emoji">🏢</span><div><span class="label">Evento</span><span class="value">' + clienteNombre + '</span></div></div>' +
    (lugar ? '<div class="info-row"><span class="emoji">📍</span><div><span class="label">Lugar</span><span class="value">' + lugar + '</span></div></div>' : '') +
    (fechaStr ? '<div class="info-row"><span class="emoji">📅</span><div><span class="label">Fecha</span><span class="value">' + fechaStr + '</span></div></div>' : '') +
    (horaEntradaPrevista ? '<div class="info-row"><span class="emoji">🕐</span><div><span class="label">Entrada prevista</span><span class="value">' + horaEntradaPrevista + '</span></div></div>' : '') +
    (horaSalidaPrevista ? '<div class="info-row"><span class="emoji">🕐</span><div><span class="label">Salida prevista</span><span class="value">' + horaSalidaPrevista + '</span></div></div>' : '') +
    '</div>' +
    qrSection +
    '</div></div>' +
    qrScript +
    '</body></html>';
}

export function htmlFichajeError(msg: string) {
  return '<!DOCTYPE html>' +
    '<html lang="es"><head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Error de fichaje</title>' +
    '<style>' +
    'body{font-family:-apple-system,sans-serif;background:#fef2f2;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:1.5rem}' +
    '.card{background:white;border-radius:16px;padding:2rem;max-width:380px;width:100%;text-align:center;border-top:5px solid #dc2626;box-shadow:0 4px 20px rgba(0,0,0,0.08)}' +
    '.icon{font-size:3rem;margin-bottom:1rem}' +
    'h1{color:#dc2626;font-size:1.3rem;margin-bottom:0.5rem}' +
    'p{color:#6b7280;font-size:0.9rem;line-height:1.5}' +
    '</style></head><body>' +
    '<div class="card">' +
    '<div class="icon">❌</div>' +
    '<h1>Error de fichaje</h1>' +
    '<p>' + msg + '</p>' +
    '</div></body></html>';
}

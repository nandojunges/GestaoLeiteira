import { useState, useCallback, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';

export default function ModalFoto({ imagem, recorte, setImagem, setRecorte, onSalvar, onFechar }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(recorte || null);
  const [arquivo, setArquivo] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onFechar]);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedPixels(croppedAreaPixels);
    setRecorte?.({ ...croppedAreaPixels, zoom });
  }, [setRecorte, zoom]);

  const aoEscolherImagem = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArquivo(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagem(reader.result);
    reader.readAsDataURL(file);
  };

  const salvar = async () => {
    if (!imagem || !croppedPixels) return;
    const img = new Image();
    img.src = imagem;
    await new Promise((res) => { img.onload = res; });
    const canvas = document.createElement('canvas');
    canvas.width = croppedPixels.width;
    canvas.height = croppedPixels.height;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.beginPath();
    ctx.arc(croppedPixels.width / 2, croppedPixels.height / 2, croppedPixels.width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      img,
      croppedPixels.x,
      croppedPixels.y,
      croppedPixels.width,
      croppedPixels.height,
      0,
      0,
      croppedPixels.width,
      croppedPixels.height
    );
    ctx.restore();
    const resultado = canvas.toDataURL('image/jpeg', 0.6);
    onSalvar({ arquivo, original: imagem, cropped: resultado, crop: { ...croppedPixels, zoom } });
  };

  if (!imagem)
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onFechar}>
        <div
          className="bg-white rounded-xl p-4 w-[90vw] max-w-sm space-y-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onFechar}
            className="absolute top-2 right-2 text-xl px-2 hover:text-red-600"
          >
            ❌
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Selecionar imagem
          </button>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={aoEscolherImagem}
            ref={inputRef}
          />
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onFechar}>
      <div className="bg-white rounded-xl p-4 w-[90vw] max-w-sm space-y-4 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onFechar} className="absolute top-2 right-2 text-xl px-2 hover:text-red-600">❌</button>
        <div className="relative mx-auto w-72 h-72">
          <Cropper
            image={imagem}
            crop={crop}
            zoom={zoom}
            cropShape="round"
            aspect={1}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between items-center">
          <button
            onClick={() => inputRef.current?.click()}
            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            Alterar imagem
          </button>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={aoEscolherImagem}
            ref={inputRef}
          />
          <div className="flex gap-2">
            <button onClick={onFechar} className="px-4 py-2 rounded bg-gray-200">Cancelar</button>
            <button onClick={salvar} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Aplicar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

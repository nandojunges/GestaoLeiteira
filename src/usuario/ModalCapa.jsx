import { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';

export default function ModalCapa({ imagem, recorte, setImagem, setRecorte, onSalvar, onFechar }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState(recorte || null);
  const [arquivo, setArquivo] = useState(null);

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onFechar();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onFechar]);

  const onCropComplete = useCallback((_, croppedAreaPixels) => {
    setCroppedPixels(croppedAreaPixels);
    setRecorte?.(croppedAreaPixels);
  }, [setRecorte]);

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
    const resultado = canvas.toDataURL('image/jpeg', 0.6);
    onSalvar({
      arquivo,
      original: imagem,
      cropped: resultado,
      crop: croppedPixels,
    });
  };

  if (!imagem)
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
        onClick={onFechar}
      >
        <div
          className="bg-white rounded-xl p-4 space-y-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onFechar}
            className="absolute top-2 right-2 text-xl px-2 hover:text-red-600"
          >
            ❌
          </button>
          <input type="file" accept="image/*" onChange={aoEscolherImagem} />
        </div>
      </div>
    );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onFechar}
    >
      <div
        className="bg-white rounded-xl p-4 space-y-4 relative"
        style={{ maxWidth: '90vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onFechar}
          className="absolute top-2 right-2 text-xl px-2 hover:text-red-600"
        >
          ❌
        </button>
        <div className="relative mx-auto" style={{ width: '90vw', maxHeight: '80vh', height: '80vh' }}>
          <Cropper
            image={imagem}
            crop={crop}
            zoom={zoom}
            aspect={4}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="flex justify-between items-center pt-2">
          <input type="file" accept="image/*" onChange={aoEscolherImagem} />
          <div className="flex gap-2">
            <button onClick={onFechar} className="px-4 py-2 rounded bg-gray-200">
              Cancelar
            </button>
            <button
              onClick={salvar}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Salvar alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

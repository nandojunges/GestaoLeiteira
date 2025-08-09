const infoIcon = '/icones/informacoes.png';

export default function IconeInfo({ onClick }) {
  return (
    <img
      src={infoIcon}
      alt="Informações"
      style={{
        width: 28,
        height: 28,
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        boxShadow: 'none',
      }}
      onClick={onClick}
    />
  );
}
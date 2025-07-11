export default function CardFinanceiro({ titulo, valor, icone, tipo, onClick, tooltip }) {
  const props = {};
  if (typeof onClick === 'function') props.onClick = onClick;
  return (
    <div {...props} className={`card card-${tipo}`} title={tooltip}>
      <div className="icone">{icone}</div>
      <h4>{titulo}</h4>
      <p className="valor">{valor}</p>
    </div>
  );
}

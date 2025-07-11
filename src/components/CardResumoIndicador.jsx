// 📁 src/components/CardResumoIndicador.jsx
export default function CardResumoIndicador({ titulo, valor, unidade }) {
    return (
      <div className="bg-white rounded-2xl shadow p-4 text-center">
        <h3 className="text-blue-900 font-semibold text-sm mb-1">{titulo}</h3>
        <p className="text-2xl font-bold text-gray-900">
          {valor} {unidade && <span className="text-base font-medium text-gray-500">{unidade}</span>}
        </p>
      </div>
    );
  }
  
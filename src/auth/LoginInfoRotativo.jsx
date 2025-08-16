import { useEffect, useState } from 'react'

export default function LoginInfoRotativo() {
  const [itens, setItens] = useState([])

  useEffect(() => {
    const nomes = ['01.txt', '02.txt', '03.txt']
    const base = '/data/rotativos' // você coloca os arquivos nessa pasta (public/data/rotativos)

    async function carregarArquivos() {
      try {
        const respostas = await Promise.all(
          nomes.map(n => fetch(`${base}/${n}`))
        )
        const textos = await Promise.all(respostas.map(r => {
          if (!r.ok) throw new Error(`Falha ao carregar ${r.url}`)
          return r.text()
        }))
        setItens(textos)
      } catch (e) {
        console.error('Erro ao carregar arquivos rotativos:', e)
        setItens([])
      }
    }

    carregarArquivos()
  }, [])

  return (
    <div className="p-4 text-center text-gray-700">
      {itens.length > 0 ? (
        itens.map((txt, i) => (
          <p key={i} className="mb-2">{txt}</p>
        ))
      ) : (
        <p>Carregando informações...</p>
      )}
    </div>
  )
}

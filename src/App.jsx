import { useState, useEffect } from 'react'
import { PokemonCard } from './components/PokemonCard'
import {
  obtenerCatalogo,
  buscarPokemon,
  obtenerEquipo,
  guardarPokemon,
  guardarEquipo,
  obtenerEquiposGuardados,
  LIMITE
} from './components/data/pokemonData'
import { validarAgregar } from './components/logic/pokemonLogic'
import './App.css'

function App() {
  const [pokemon, setPokemon] = useState([])
  const [equipo, setEquipo] = useState([])
  const [equiposGuardados, setEquiposGuardados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [errorEquipo, setErrorEquipo] = useState(null)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)
  const [texto, setTexto] = useState('')
  const [consulta, setConsulta] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Cargar catálogo o buscar un Pokémon
  useEffect(() => {
    let cancelado = false

    async function cargar() {
      setCargando(true)
      setError(null)

      try {
        if (consulta) {
          const resultado = await buscarPokemon(consulta)

          if (!cancelado) {
            setPokemon([resultado])
          }
        } else {
          const resultado = await obtenerCatalogo(offset)

          if (!cancelado) {
            setPokemon(resultado.pokemon)
            setTotal(resultado.total)
          }
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message)
          setPokemon([])
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargar()

    return () => {
      cancelado = true
    }
  }, [offset, consulta])

  // Cargar los equipos guardados al iniciar
  useEffect(() => {
    actualizarEquiposGuardados()
  }, [])

  async function actualizarEquiposGuardados() {
    try {
      const datos = await obtenerEquiposGuardados()
      setEquiposGuardados(datos)
    } catch (err) {
      setErrorEquipo(`Error al cargar los equipos: ${err.message}`)
    }
  }

  // Agregar un Pokémon al equipo actual
  async function agregar(p) {
    const validacion = validarAgregar(equipo, p)

    if (!validacion.valido) {
      setErrorEquipo(validacion.mensaje)
      return
    }

    try {
      setErrorEquipo(null)

      // Guardar el Pokémon en la colección original
      await guardarPokemon(p)

      setEquipo((actual) => [...actual, p])
    } catch (err) {
      setErrorEquipo(`No se pudo agregar el Pokémon: ${err.message}`)
    }
  }

  // Guardar una copia del equipo actual
  async function guardarEquipoActual() {
    if (equipo.length === 0) {
      setErrorEquipo('Agrega al menos un Pokémon antes de guardar.')
      return
    }

    try {
      setGuardando(true)
      setErrorEquipo(null)

      await guardarEquipo(equipo)
      await actualizarEquiposGuardados()

      setErrorEquipo('¡Equipo guardado correctamente!')
    } catch (err) {
      setErrorEquipo(`No se pudo guardar el equipo: ${err.message}`)
    } finally {
      setGuardando(false)
    }
  }

  // Guardar el equipo actual y empezar uno nuevo
  async function nuevoEquipo() {
    try {
      setGuardando(true)
      setErrorEquipo(null)

      if (equipo.length > 0) {
        await guardarEquipo(equipo)
        await actualizarEquiposGuardados()
      }

      setEquipo([])
      setErrorEquipo('Equipo nuevo listo. ¡Elige tus Pokémon!')
    } catch (err) {
      setErrorEquipo(`No se pudo guardar el equipo anterior: ${err.message}`)
    } finally {
      setGuardando(false)
    }
  }

  // Cargar un equipo guardado
  function cargarEquipoGuardado(e) {
    if (!Array.isArray(e.pokemon)) {
      setErrorEquipo('Este equipo guardado no tiene un formato válido.')
      return
    }

    setEquipo(e.pokemon)
    setErrorEquipo('Equipo cargado correctamente.')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function buscar(e) {
    e.preventDefault()
    setOffset(0)
    setConsulta(texto.trim().toLowerCase())
  }

  function verTodos() {
    setTexto('')
    setConsulta('')
    setOffset(0)
    setErrorEquipo(null)
  }

  return (
    <>
      <h1>Pokédex</h1>

      <h2>Mi equipo ({equipo.length}/6)</h2>

      <div className="acciones-equipo">
        <button
          onClick={guardarEquipoActual}
          disabled={guardando || equipo.length === 0}
        >
          {guardando ? 'Guardando...' : 'Guardar equipo'}
        </button>

        <button
          type="button"
          onClick={nuevoEquipo}
          disabled={guardando}
        >
          Nuevo equipo
        </button>
      </div>

      <section className="equipo">
        {equipo.map((p) => (
          <PokemonCard key={p.id} pokemon={p} />
        ))}
      </section>

      {equipo.length === 0 && (
        <p>Tu equipo está vacío. Agrega hasta 6 Pokémon.</p>
      )}

      {errorEquipo && (
        <p className="error">{errorEquipo}</p>
      )}

      <h2>Equipos guardados ({equiposGuardados.length})</h2>

      <section className="equipos-guardados">
        {equiposGuardados.map((e, indice) => (
          <div className="equipo-guardado" key={e.id}>
            <h3>Equipo {indice + 1}</h3>
            <p>{e.pokemon?.length ?? 0} Pokémon</p>

            <div className="miniaturas-equipo">
              {e.pokemon?.map((p) => (
                <img
                  key={p.id}
                  src={p.sprites?.front_default}
                  alt={p.name}
                  title={p.name}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => cargarEquipoGuardado(e)}
            >
              Cargar equipo
            </button>
          </div>
        ))}
      </section>

      <h2>Buscar Pokémon</h2>

      <form onSubmit={buscar}>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Nombre o número del Pokémon"
        />

        <button type="submit">Buscar</button>

        <button type="button" onClick={verTodos}>
          Ver todos
        </button>
      </form>

      {cargando && <p>Cargando Pokémon...</p>}

      {error && <p className="error">{error}</p>}

      {!cargando && !error && (
        <section className="catalogo">
          {pokemon.map((p) => {
            const agregado = equipo.some((e) => e.id === p.id)

            return (
              <div key={p.id}>
                <PokemonCard pokemon={p} />

                <button
                  onClick={() => agregar(p)}
                  disabled={agregado || equipo.length >= 6}
                >
                  {agregado
                    ? 'Ya está en tu equipo'
                    : equipo.length >= 6
                      ? 'Equipo completo'
                      : 'Agregar al equipo'}
                </button>
              </div>
            )
          })}
        </section>
      )}

      {!consulta && !cargando && !error && (
        <nav>
          <button
            onClick={() =>
              setOffset((actual) => Math.max(0, actual - LIMITE))
            }
            disabled={offset === 0}
          >
            Anterior
          </button>

          <span>
            Página {Math.floor(offset / LIMITE) + 1} de{' '}
            {Math.ceil(total / LIMITE)}
          </span>

          <button
            onClick={() => setOffset((actual) => actual + LIMITE)}
            disabled={offset + LIMITE >= total}
          >
            Siguiente
          </button>
        </nav>
      )}
    </>
  )
}

export default App

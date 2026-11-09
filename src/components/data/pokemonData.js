import { doc, setDoc, getDocs, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../firebase'

const API = 'https://pokeapi.co/api/v2'
export const LIMITE = 25

// Obtener el catálogo de Pokémon
export async function obtenerCatalogo(offset = 0) {
    const res = await fetch(
        `${API}/pokemon?limit=${LIMITE}&offset=${offset}`
    )

    if (!res.ok) {
        throw new Error('Error al cargar Pokémon')
    }

    const data = await res.json()

    const detalles = await Promise.all(
        data.results.map(async (p) => {
            const respuesta = await fetch(p.url)

            if (!respuesta.ok) {
                throw new Error('Error al consultar un Pokémon')
            }

            return respuesta.json()
        })
    )

    return {
        pokemon: detalles,
        total: data.count
    }
}

// Buscar un Pokémon por nombre o número
export async function buscarPokemon(texto) {
    const res = await fetch(
        `${API}/pokemon/${encodeURIComponent(texto.trim().toLowerCase())}`
    )

    if (!res.ok) {
        throw new Error('Pokémon no encontrado')
    }

    return res.json()
}

// Obtener equipo guardado
export async function obtenerEquipo() {
    const snap = await getDocs(collection(db, 'equipo'))

    return snap.docs.map((d) => ({
        ...d.data(),
        id: Number(d.id)
    }))
}

// Guardar un Pokémon en Firestore
export async function guardarPokemon(p) {
    await setDoc(doc(db, 'equipo', String(p.id)), p)
}
// Guardar un equipo completo en Firebase

// Guardar un equipo reducido en Firebase
export async function guardarEquipo(equipo) {
    const equipoReducido = equipo.map(resumirPokemon)

    await addDoc(collection(db, 'equipos'), {
        pokemon: equipoReducido,
        creadoEn: serverTimestamp()
    })
}

// Obtener todos los equipos guardados
export async function obtenerEquiposGuardados() {
    const snap = await getDocs(collection(db, 'equipos'))

    return snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
    }))
}
// Guardar solo los datos necesarios de cada Pokémon
function resumirPokemon(p) {
    return {
        id: p.id,
        name: p.name,
        sprites: {
            front_default: p.sprites?.front_default ?? null
        },
        types: (p.types ?? []).map((t) => ({
            slot: t.slot,
            type: {
                name: t.type.name
            }
        }))
    }
}

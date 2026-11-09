
export function validarAgregar(equipo, pokemon) {
    if (equipo.length >= 6) {
        return {
            valido: false,
            mensaje: 'Tu equipo ya tiene 6 Pokémon.'
        }
    }

    if (equipo.some((p) => p.id === pokemon.id)) {
        return {
            valido: false,
            mensaje: 'Este Pokémon ya está en tu equipo.'
        }
    }

    return {
        valido: true,
        mensaje: ''
    }
}

export function agregarAlEquipo(equipo, pokemon) {
    const validacion = validarAgregar(equipo, pokemon)

    if (!validacion.valido) {
        return {
            equipo,
            error: validacion.mensaje
        }
    }

    return {
        equipo: [...equipo, pokemon],
        error: null
    }
}

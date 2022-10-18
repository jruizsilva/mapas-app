import React, { useContext, useEffect } from 'react'
import { SocketContext } from '../context/SocketContext'
import { useMapbox } from '../hooks/useMapbox'

const puntoInicial = {
  lng: -122.4663,
  lat: 37.7992,
  zoom: 13.8562
}

const MapaPage = () => {
  const {
    coords,
    setRef,
    nuevoMarcador$,
    movimientoMarcador$,
    agregarMarcador,
    actualizarPosition
  } = useMapbox(puntoInicial)
  const { socket } = useContext(SocketContext)

  useEffect(() => {
    socket.on('marcadores-activos', marcadores => {
      for (const key of Object.keys(marcadores)) {
        agregarMarcador(marcadores[key], key)
      }
    })
  }, [socket, agregarMarcador])

  useEffect(() => {
    nuevoMarcador$.subscribe(marcador => {
      socket.emit('marcador-nuevo', marcador)
    })
  }, [socket, nuevoMarcador$])

  useEffect(() => {
    socket.on('marcador-nuevo', marcador => {
      agregarMarcador(marcador, marcador.id)
    })
  }, [socket, agregarMarcador])

  useEffect(() => {
    movimientoMarcador$.subscribe(marcador => {
      socket.emit('marcador-actualizado', marcador)
    })
  }, [socket, movimientoMarcador$])

  useEffect(() => {
    socket.on('marcador-actualizado', marcador => {
      actualizarPosition(marcador)
    })
  }, [socket, actualizarPosition])

  return (
    <>
      <div className='info'>
        Lng: {coords.lng} | lat: {coords.lat} | zoom:{' '}
        {coords.zoom}
      </div>
      <div ref={setRef} className='map-container' />
    </>
  )
}

export default MapaPage

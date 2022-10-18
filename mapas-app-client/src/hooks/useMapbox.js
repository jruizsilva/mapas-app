import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import mapboxgl from 'mapbox-gl'
import { v4 as uuidv4 } from 'uuid'
import { Subject } from 'rxjs'

mapboxgl.accessToken =
  'pk.eyJ1IjoianJ1aXpzaWx2YSIsImEiOiJjbDlkbTl3aHowMHV4M3dveWN1Nnc2cGIxIn0.GEKQUi5ShP0VYcvJhZ-AIA'

export const useMapbox = puntoInicial => {
  const mapaDiv = useRef(null)
  const setRef = useCallback(node => {
    mapaDiv.current = node
  }, [])
  const mapa = useRef(null)
  const [coords, setCoords] = useState(puntoInicial)

  const marcadores = useRef({})

  const movimientoMarcador = useRef(new Subject())
  const nuevoMarcador = useRef(new Subject())

  const agregarMarcador = useCallback((e, id) => {
    const { lng, lat } = e.lngLat ?? e
    const marker = new mapboxgl.Marker()
    marker.id = id ?? uuidv4()

    marker
      .setLngLat([lng, lat])
      .addTo(mapa.current)
      .setDraggable(true)

    marcadores.current[marker.id] = marker

    if (!id) {
      nuevoMarcador.current.next({
        id: marker.id,
        lng,
        lat
      })
    }

    marker.on('drag', e => {
      const id = e.target.id
      const { lng, lat } = e.target.getLngLat()
      movimientoMarcador.current.next({ id, lng, lat })
    })
  }, [])

  const actualizarPosition = useCallback(marcador => {
    const { id, lng, lat } = marcador
    marcadores.current[id].setLngLat([lng, lat])
  }, [])

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapaDiv.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [puntoInicial.lng, puntoInicial.lat],
      zoom: puntoInicial.zoom
    })
    mapa.current = map
  }, [puntoInicial])

  useEffect(() => {
    mapa.current?.on('move', () => {
      const { lng, lat } = mapa.current.getCenter()
      const zoom = mapa.current.getZoom()
      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: zoom.toFixed(4)
      })
    })
    return () => {
      mapa.current?.off('move')
    }
  }, [])

  useEffect(() => {
    mapa.current?.on('click', agregarMarcador)
    return () => {
      mapa.current?.off('click')
    }
  }, [agregarMarcador])

  return {
    coords,
    setRef,
    marcadores,
    nuevoMarcador$: nuevoMarcador.current,
    movimientoMarcador$: movimientoMarcador.current,
    agregarMarcador,
    actualizarPosition
  }
}

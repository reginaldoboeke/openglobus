/* eslint-disable @typescript-eslint/no-explicit-any */
import '@openglobus/openglobus-react/dist/style.css'
import Globus, { useGlobusContext } from '@openglobus/openglobus-react'
import { Entity, GlobusTerrain, LonLat, Polyline, Vector, XYZ, math } from '@openglobus/og';
import { useEffect } from 'react';

import { routes as data } from './assets/routes'

const POINTS_NUMBER = 70;

const collection = new Vector("Collection", {
  'entities': []
});

const osm = new XYZ("OpenStreetMap", {
    isBaseLayer: true,
    url: "//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    visibility: true,
    attribution: 'Data @ OpenStreetMap contributors, ODbL'
});

export function OpenGlobus() {
    const { globus } = useGlobusContext()

    function getRoutes() {
        if (!globus) return

          const paths = [];
        const colors: any[] = [];
  
          const animIndex: any[] = [];
  
          for (let i = 0; i < data.length; i++) {
              const p = data[i],
                  dst = new LonLat(Number(p.dstAirport.lng), Number(p.dstAirport.lat)),
                  src = new LonLat(Number(p.srcAirport.lng), Number(p.srcAirport.lat));
  
              const path = getPath(globus.planet.ellipsoid, src, dst);
  
              paths.push(path.path);
              colors.push(path.colors);
  
              animIndex.push(math.randomi(0, POINTS_NUMBER));
          }
  
          console.log({ data })
  
          const entity = new Entity({
              'polyline': {
                  'path3v': paths,
                  'pathColors': colors,
                  'thickness': 1.8,
                  'color': "red",
                  'isClosed': false
              }
          });
  
          collection.add(entity);

          if (!globus.planet.renderer) {
            return;
          }
  
          globus.planet.renderer.handler.defaultClock.setInterval(35, () => {
              const e = collection.getEntities()[0].polyline as Polyline;
              const cArr = e.getPathColors();
              for (let i = 0; i < cArr.length; i++) {
                  animIndex[i]++;
                  let ind = animIndex[i];
                  if (ind > POINTS_NUMBER + 4) {
                      animIndex[i] = 0;
                      ind = 0;
                  }
  
                  const r = colors[i][0][0],
                      g = colors[i][0][1],
                      b = colors[i][0][2];
                  e.setPointColor([r, g, b, 0.8], ind, i);
                  e.setPointColor([r, g, b, 0.6], ind - 1, i);
                  e.setPointColor([r, g, b, 0.3], ind - 2, i);
                  e.setPointColor([r, g, b, 0.1], ind - 3, i);
                  e.setPointColor(colors[i][ind] || colors[i][POINTS_NUMBER - 1], ind - 4, i);
              }
          });
    }
  
    
  
      function getPath(ell: any, start: any, end: any) {
          const num = POINTS_NUMBER;
  
          const {distance, initialAzimuth} = ell.inverse(start, end);
  
          const p25 = ell.getGreatCircleDestination(start, initialAzimuth, distance * 0.25),
              p75 = ell.getGreatCircleDestination(start, initialAzimuth, distance * 0.75);
  
          start.height = 50;
          end.height = 50;
          const h = distance / 4;
          p25.height = h;
          p75.height = h;
  
          const startCart = ell.lonLatToCartesian(start),
              endCart = ell.lonLatToCartesian(end),
              p25Cart = ell.lonLatToCartesian(p25),
              p75Cart = ell.lonLatToCartesian(p75);
  
          const path = [],
              colors = [];
          const color = [math.random(0, 2), math.random(0, 2), math.random(0, 2)];
          for (let i = 0; i <= num; i++) {
              const cn = math.bezier3v(i / num, startCart, p25Cart, p75Cart, endCart);
              path.push(cn);
  
              colors.push([color[0], color[1], color[2], 0.1]);
          }
  
          return {
              path: path,
              colors: colors
          };
      }
  
    useEffect(() => {
      if (globus) {
        getRoutes()
      }
      console.log('globus', globus)
    }, [globus])

    return (
        <Globus options={{
            target: "globus",
            name: "Earth",
            terrain: new GlobusTerrain(),
            layers: [osm, collection],
            resourcesSrc: "../../external/og/lib/@openglobus/res",
            fontsSrc: "../../external/og/lib/@openglobus/res/fonts"
        }} />
    );
}


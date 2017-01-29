
export function pointHorizontalBounds (point, min, max) {
  if (point.x < min) {
    point.x = min
  } else if (point.x > max) {
    point.x = max
  }
}

export function pointVerticalBounds (point, min, max) {
  if (point.y < min) {
    point.y = min
  } else if (point.y > max) {
    point.y = max
  }
}

export function splineCurve (firstPoint, middlePoint, afterPoint, tension) {
  // Props to Rob Spencer at scaled innovation for his post on splining between points
  // http://scaledinnovation.com/analytics/splines/aboutSplines.html
  const d01 = Math.sqrt(Math.pow(middlePoint.x - firstPoint.x, 2) + Math.pow(middlePoint.y - firstPoint.y, 2))
  const d12 = Math.sqrt(Math.pow(afterPoint.x - middlePoint.x, 2) + Math.pow(afterPoint.y - middlePoint.y, 2))
  const fa = tension * d01 / (d01 + d12) // scaling factor for triangle Ta
  const fb = tension * d12 / (d01 + d12)
  return {
    inner: {
      x: middlePoint.x - fa * (afterPoint.x - firstPoint.x),
      y: middlePoint.y - fa * (afterPoint.y - firstPoint.y),
    },
    outer: {
      x: middlePoint.x + fb * (afterPoint.x - firstPoint.x),
      y: middlePoint.y + fb * (afterPoint.y - firstPoint.y),
    },
  }
}

export function getSplinePoints (points, height, tension = 0.5) {
  const result = []

  for (let i = 1; i < points.length - 1; i++) {
    const currentPoint = points[i]
    const previousPoint = points[i - 1]
    const nextPoint = points[i + 1]

    const controlPoints = splineCurve(previousPoint, currentPoint, nextPoint, tension)

    pointVerticalBounds(controlPoints.inner, 0, height)
    pointVerticalBounds(controlPoints.outer, 0, height)

    result.push({
      controlPoints,
      point: currentPoint,
    })
  }

  return result
}

export function getSplineCurves (points, height, tension) {
  const result = []
  const splinePoints = getSplinePoints(points, height, tension)

  for (let i = 1; i < splinePoints.length; i++) {
    const previousPoint = splinePoints[i - 1]
    const currentPoint = splinePoints[i]
    const coords = [
      previousPoint.controlPoints.outer.x,
      previousPoint.controlPoints.outer.y,
      currentPoint.controlPoints.inner.x,
      currentPoint.controlPoints.inner.y,
      currentPoint.point.x,
      currentPoint.point.y,
    ]
    result.push(coords)
  }

  return result
}

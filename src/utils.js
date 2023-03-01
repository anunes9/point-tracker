export const drawGrid = ({
  ctx,
  coordSystem,
  hideGrid = false,
  hideGridX = false,
  hideGridY = false,
  gridColor = 'rgba(150,150,150,0.17)',
  gridSizeX = 25,
  gridSizeY = 25,
  gridLineWidth = 0.5
}) => {
  if (hideGrid) return

  const gridSize = 25
  const { viewMin, viewMax } = coordSystem.canvasBounds
  const minx = Math.floor(viewMin.x / gridSize - 1) * gridSize
  const miny = Math.floor(viewMin.y / gridSize - 1) * gridSize
  const maxx = viewMax.x + gridSize
  const maxy = viewMax.y + gridSize

  ctx.beginPath()
  ctx.setLineDash([5, 1])
  ctx.setLineDash([])
  ctx.strokeStyle = gridColor
  ctx.lineWidth = gridLineWidth

  if (!hideGridX) {
    let countX = minx
    while (countX < maxx) {
      countX += gridSizeX
      ctx.moveTo(countX, miny)
      ctx.lineTo(countX, maxy)
    }
    ctx.stroke()
  }

  if (!hideGridY) {
    let countY = miny
    while (countY < maxy) {
      countY += gridSizeY
      ctx.moveTo(minx, countY)
      ctx.lineTo(maxx, countY)
    }
    ctx.stroke()
  }
}

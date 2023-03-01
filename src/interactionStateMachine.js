const SUPPRESS_SCROLL = (e) => {
  // No zooming while drawing, but we'll cancel the scroll event.
  e.preventDefault()
  return this
}

/**
 * The default state for the interaction state machine. Supports zoom and
 * initiating pan and drawing actions.
 */
export class DefaultState {
  handleMouseWheel = (e, canvasDraw) => this

  handleDrawStart = (e, canvasDraw) => {
    if (canvasDraw.props.disabled) return new DisabledState()

    return new DrawingState().handleDrawStart(e, canvasDraw)
  }

  handleDrawMove = (e, canvasDraw) => {
    if (canvasDraw.props.disabled) {
      return new DisabledState()
    } else {
      const { x, y } = viewPointFromEvent(canvasDraw.coordSystem, e)
      console.log('update')
      canvasDraw.lazy.update({ x, y })
      return this
    }
  }

  handleDrawEnd = (e, canvasDraw) => (canvasDraw.props.disabled ? new DisabledState() : this)
}

/**
 * This state is used as long as the disabled prop is active. It ignores all
 * events and doesn't prevent default actions. The disabled state can only be
 * triggered from the default state (i.e., while no action is actively being
 * performed).
 */
export class DisabledState {
  handleMouseWheel = (e, canvasDraw) => {
    if (canvasDraw.props.disabled) {
      return this
    } else {
      return new DefaultState().handleMouseWheel(e, canvasDraw)
    }
  }

  handleDrawStart = (e, canvasDraw) => {
    if (canvasDraw.props.disabled) {
      return this
    } else {
      return new DefaultState().handleDrawStart(e, canvasDraw)
    }
  }

  handleDrawMove = (e, canvasDraw) => {
    if (canvasDraw.props.disabled) {
      return this
    } else {
      return new DefaultState().handleDrawMove(e, canvasDraw)
    }
  }

  handleDrawEnd = (e, canvasDraw) => {
    if (canvasDraw.props.disabled) {
      return this
    } else {
      return new DefaultState().handleDrawEnd(e, canvasDraw)
    }
  }
}

/**
 * This state is active when the user is drawing.
 */
export class DrawingState {
  constructor() {
    this.isDrawing = false
  }

  handleMouseWheel = SUPPRESS_SCROLL.bind(this)

  handleDrawStart = (e, canvasDraw) => {
    e.preventDefault()

    if (e.touches && e.touches.length) {
      // on touch, set catenary position to touch pos
      const { x, y } = viewPointFromEvent(canvasDraw.coordSystem, e)
      console.log('draw start')
      canvasDraw.lazy.update({ x, y }, { both: true })
    }

    return this.handleDrawMove(e, canvasDraw)
  }

  handleDrawMove = (e, canvasDraw) => {
    e.preventDefault()

    const { x, y } = viewPointFromEvent(canvasDraw.coordSystem, e)
    console.log('draw move', 'x', x, 'y', y)
    canvasDraw.lazy.update({ x, y })
    const isDisabled = !canvasDraw.lazy.isEnabled()

    if (!this.isDrawing || isDisabled) {
      // Start drawing and add point
      canvasDraw.points.push(canvasDraw.lazy.brush.toObject())
      this.isDrawing = true
    }

    // Add new point
    canvasDraw.points.push(canvasDraw.lazy.brush.toObject())

    // Draw current points
    canvasDraw.drawPoints({
      points: canvasDraw.points,
      brushColor: canvasDraw.props.brushColor,
      brushRadius: canvasDraw.props.brushRadius
    })

    return this
  }

  handleDrawEnd = (e, canvasDraw) => {
    e.preventDefault()

    // Draw to this end pos
    this.handleDrawMove(e, canvasDraw)
    canvasDraw.saveLine()

    return new DefaultState()
  }
}

export function clientPointFromEvent(e) {
  // use cursor pos as default
  let clientX = e.clientX
  let clientY = e.clientY

  // use first touch if available
  if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX
    clientY = e.changedTouches[0].clientY
  }

  return { clientX, clientY }
}

export function viewPointFromEvent(coordSystem, e) {
  return coordSystem.clientPointToViewPoint(clientPointFromEvent(e))
}

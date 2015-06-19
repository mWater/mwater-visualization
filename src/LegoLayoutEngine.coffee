
# Layout engine that places blocks like lego and displaces others out of the way
module.exports = class LegoLayoutEngine 
  constructor: (width, blocksAcross) ->
    @width = width
    @blocksAcross = blocksAcross
    @scale = @width / @blocksAcross

  # Get the bounds of a layout (x, y, width, height)
  getLayoutBounds: (layout) ->
    return {
      x: @scale * layout.x
      y: @scale * layout.y
      width: @scale * layout.w
      height: @scale * layout.h
    }

  # Inserts a rectangle (x, y, width, height)
  # Returns { layouts (modified to make room) and rectLayout (layout of new rectangle) }
  insertRect: (layouts, rect) ->
    # Get snapped approximate location
    x = Math.round(rect.x / @scale)
    y = Math.round(rect.y / @scale)
    w = Math.round(rect.width / @scale)
    h = Math.round(rect.height / @scale)

    # Clip
    if x < 0 then x = 0 
    if y < 0 then y = 0 
    if x >= @blocksAcross then x = @blocksAcross - 1

    if w < 1 then w = 1
    if x + w > @blocksAcross then w = @blocksAcross - x

    if h < 1 then h = 1

    # Create list of placed layouts to avoid as placing new ones
    placedLayouts = []

    # Add inserted first to displace others
    placedLayouts.push({ x: x, y: y, w: w, h: h })

    # Order existing by reading order (l->r, top->bottom)
    toProcess = _.sortBy(layouts, (l) => l.x + l.y * @blocksAcross)

    # Process each layout, avoiding all previous
    for layout in toProcess
      # Check if overlaps
      while _.any(placedLayouts, (pl) => @overlaps(pl, layout))
        layout = @shiftLayout(layout)
      placedLayouts.push(layout)

    return { layouts: placedLayouts.slice(1), rectLayout: { x: x, y: y, w: w, h: h }}

  # Check if layouts overlap
  overlaps: (a, b) ->
    if a.x + a.w <= b.x
      return false
    if a.y + a.h <= b.y
      return false
    if a.x >= b.x + b.w
      return false
    if a.y >= b.y + b.h
      return false
    return true

  # Shifts layout right or down if no more room
  shiftLayout: (layout) ->
    if layout.x + layout.w < @blocksAcross
      return { x: layout.x + 1, y: layout.y, w: layout.w, h: layout.h }
    return { x: 0, y: layout.y + 1, w: layout.w, h: layout.h }
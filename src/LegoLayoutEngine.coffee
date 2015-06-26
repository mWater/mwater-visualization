
# Layout engine that places blocks like lego and displaces others out of the way
module.exports = class LegoLayoutEngine 
  constructor: (width, blocksAcross) ->
    @width = width
    @blocksAcross = blocksAcross
    @scale = @width / @blocksAcross

  # Calculate the total height needed to fit all layouts plus one row
  calculateHeight: (layouts) ->
    bottom = _.max(_.map(_.values(layouts), (l) => @getLayoutBounds(l).y + @getLayoutBounds(l).height))
    return bottom + @scale

  # Get the bounds of a layout (x, y, width, height)
  getLayoutBounds: (layout) ->
    return {
      x: @scale * layout.x
      y: @scale * layout.y
      width: @scale * layout.w
      height: @scale * layout.h
    }

  # Converts a rectangle to a layout
  rectToLayout: (rect) ->
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

    return { x: x, y: y, w: w, h: h }

  # Arranges a layout, making all blocks fit. Optionally prioritizes
  # a particular item.
  # layouts is lookup of id -> layout
  # priority is optional id to layout first
  # Returns layout lookup of id -> layout
  performLayout: (layouts, priority) ->
    # Create list of placed layouts to avoid as placing new ones 
    placedLayouts = []
    results = {}

    # Add priority first to displace others
    if priority
      placedLayouts.push(layouts[priority])
      results[priority] = layouts[priority]

    # Order all by reading order (l->r, top->bottom)
    toProcess = _.sortBy(_.keys(layouts), (id) => 
      l = layouts[id]
      return l.x + l.y * @blocksAcross
    )

    # Process each layout, avoiding all previous
    for id in toProcess
      # Skip priority one
      if id == priority
        continue

      # Check if overlaps
      layout = layouts[id]
      while _.any(placedLayouts, (pl) => @overlaps(pl, layout))
        # Move around until fits
        layout = @shiftLayout(layout)

      placedLayouts.push(layout)
      results[id] = layout

    return results

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